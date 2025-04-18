
import { OcrLanguage } from "@/lib/ocr/types";
import { OcrFactory } from "@/lib/ocr/OcrFactory";
import { createWorker } from "tesseract.js";
import * as pdfjs from "pdfjs-dist";

// Configure PDF.js worker
const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.entry");
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Determines if a file needs OCR processing
 */
export const needsOcr = (file: File): boolean => {
  return file.type === "application/pdf" || file.type.startsWith("image/");
};

/**
 * Gets the file extension from the file name
 */
export const getFileExtension = (fileName: string): string => {
  return fileName.split(".").pop()?.toLowerCase() || "";
};

/**
 * Performs OCR on a document
 */
export const performOcr = async (
  file: File,
  onProgressUpdate: (progress: number) => void,
  ocrLanguage: OcrLanguage = "spa"
): Promise<string> => {
  try {
    // Update progress to indicate we're starting
    onProgressUpdate(5);
    
    let extractedText = "";
    
    if (file.type === "application/pdf") {
      extractedText = await processPdf(file, onProgressUpdate, ocrLanguage);
    } else if (file.type.startsWith("image/")) {
      extractedText = await processImage(file, onProgressUpdate, ocrLanguage);
    } else {
      throw new Error("Unsupported file type for OCR");
    }
    
    onProgressUpdate(100);
    return extractedText;
  } catch (error) {
    console.error("OCR processing error:", error);
    throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Process a PDF file using OCR if needed
 */
async function processPdf(
  file: File,
  onProgressUpdate: (progress: number) => void,
  ocrLanguage: OcrLanguage
): Promise<string> {
  // Load the PDF document
  const arrayBuffer = await file.arrayBuffer();
  const pdfDocument = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdfDocument.numPages;
  
  let fullText = "";
  const textContents: string[] = [];
  
  // Process each page
  for (let i = 1; i <= numPages; i++) {
    // Update progress based on page number (scale from 10% to 90%)
    const pageProgress = 10 + Math.floor((i / numPages) * 80);
    onProgressUpdate(pageProgress);
    
    // Get the page
    const page = await pdfDocument.getPage(i);
    
    try {
      // Try to extract text directly first
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => "str" in item ? item.str : "")
        .join(" ");
        
      textContents.push(pageText);
    } catch (error) {
      console.warn(`Could not extract text from page ${i}, using OCR instead`, error);
      
      // Fall back to OCR for this page
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // Render the PDF page to the canvas
      await page.render({
        canvasContext: context!,
        viewport,
      }).promise;
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/png");
      });
      
      // Create file from blob
      const pageFile = new File([blob], `page-${i}.png`, { type: "image/png" });
      
      // Use OCR on the rendered page
      const ocr = OcrFactory.getProvider("tesseract");
      const result = await ocr.extractText(
        pageFile,
        (p) => {
          // Scale OCR progress within this page's range
          const scaledProgress = pageProgress + Math.floor(p * (80 / numPages));
          onProgressUpdate(Math.min(scaledProgress, 90));
        },
        ocrLanguage
      );
      
      textContents.push(result.text);
    }
  }
  
  // Combine all page texts
  fullText = textContents.join("\n\n=== PAGE BREAK ===\n\n");
  
  return fullText;
}

/**
 * Process an image file using OCR
 */
async function processImage(
  file: File,
  onProgressUpdate: (progress: number) => void,
  ocrLanguage: OcrLanguage
): Promise<string> {
  const ocr = OcrFactory.getProvider("tesseract");
  const result = await ocr.extractText(
    file,
    (p) => {
      // Scale OCR progress from 10% to 90%
      const scaledProgress = 10 + Math.floor(p * 0.8);
      onProgressUpdate(Math.min(scaledProgress, 90));
    },
    ocrLanguage
  );
  
  return result.text;
}
