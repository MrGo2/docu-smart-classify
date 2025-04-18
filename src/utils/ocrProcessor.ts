import { OcrLanguage } from "@/lib/ocr/types";
import { OcrFactory } from "@/lib/ocr/OcrFactory";
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
  ocrLanguage: OcrLanguage = "auto",
  ocrProviderName: string = "paddleocr"
) => {
  try {
    // Update progress to indicate we're starting
    onProgressUpdate(5);
    console.log(`Starting OCR for ${file.name} using ${ocrProviderName} with language: ${ocrLanguage}`);
    
    let extractedText = "";
    let detectedLanguage: OcrLanguage | undefined;
    
    if (file.type === "application/pdf") {
      console.log("Processing PDF document");
      const result = await processPdf(file, onProgressUpdate, ocrLanguage, ocrProviderName);
      extractedText = result.text;
      detectedLanguage = result.detectedLanguage;
    } else if (file.type.startsWith("image/")) {
      console.log("Processing image document");
      const result = await processImage(file, onProgressUpdate, ocrLanguage, ocrProviderName);
      extractedText = result.text;
      detectedLanguage = result.detectedLanguage;
    } else {
      throw new Error("Unsupported file type for OCR");
    }
    
    console.log(`OCR completed. Extracted text length: ${extractedText.length} characters`);
    onProgressUpdate(100);
    return { text: extractedText, detectedLanguage };
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
  ocrLanguage: OcrLanguage,
  ocrProviderName: string
): Promise<{ text: string; detectedLanguage?: OcrLanguage }> {
  console.log("Loading PDF document");
  
  // Load the PDF document
  const arrayBuffer = await file.arrayBuffer();
  const pdfDocument = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdfDocument.numPages;
  
  console.log(`PDF loaded successfully. Total pages: ${numPages}`);
  
  let fullText = "";
  const textContents: string[] = [];
  let detectedLanguage: OcrLanguage | undefined;
  
  // Process each page
  for (let i = 1; i <= numPages; i++) {
    // Update progress based on page number (scale from 10% to 90%)
    const pageProgress = 10 + Math.floor((i / numPages) * 80);
    onProgressUpdate(pageProgress);
    
    console.log(`Processing PDF page ${i} of ${numPages}`);
    
    // Get the page
    const page = await pdfDocument.getPage(i);
    
    try {
      // Try to extract text directly first
      console.log(`Attempting to extract text from page ${i} directly`);
      const textContent = await page.getTextContent();
      
      // Check if text was actually extracted
      const pageText = textContent.items
        .map((item: any) => "str" in item ? item.str : "")
        .join(" ");
      
      if (pageText.trim().length > 0) {
        console.log(`Successfully extracted ${pageText.length} characters of text from page ${i}`);
        textContents.push(pageText);
      } else {
        console.log(`No text extracted directly from page ${i}, using OCR instead`);
        
        // Fall back to OCR for this page
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        console.log(`Rendering page ${i} to canvas at ${canvas.width}x${canvas.height}`);
        
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
        
        console.log(`Using OCR on rendered page ${i}`);
        
        // Use OCR on the rendered page
        const ocr = OcrFactory.getProvider(ocrProviderName);
        const result = await ocr.extractText(
          pageFile,
          (p) => {
            // Scale OCR progress within this page's range
            const scaledProgress = pageProgress + Math.floor(p * (80 / numPages));
            onProgressUpdate(Math.min(scaledProgress, 90));
          },
          ocrLanguage
        );
        
        console.log(`OCR result for page ${i}: ${result.text.length} characters`);
        textContents.push(result.text);
        
        // Store detected language from first page (if auto-detection was used)
        if (i === 1 && ocrLanguage === 'auto' && result.detectedLanguage) {
          detectedLanguage = result.detectedLanguage;
          console.log(`Detected language: ${detectedLanguage}`);
        }
      }
    } catch (error) {
      console.warn(`Error extracting text from page ${i}:`, error);
      console.log(`Falling back to OCR for page ${i}`);
      
      // Fall back to OCR for this page if text extraction fails
      const viewport = page.getViewport({ scale: 2.0 });
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
      const ocr = OcrFactory.getProvider(ocrProviderName);
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
      
      // Store detected language from first page (if auto-detection was used)
      if (i === 1 && ocrLanguage === 'auto' && result.detectedLanguage) {
        detectedLanguage = result.detectedLanguage;
      }
    }
  }
  
  // Combine all page texts
  fullText = textContents.join("\n\n=== PAGE BREAK ===\n\n");
  
  console.log(`PDF processing complete. Total extracted text: ${fullText.length} characters`);
  return { text: fullText, detectedLanguage };
}

/**
 * Process an image file using OCR
 */
async function processImage(
  file: File,
  onProgressUpdate: (progress: number) => void,
  ocrLanguage: OcrLanguage,
  ocrProviderName: string
): Promise<{ text: string; detectedLanguage?: OcrLanguage }> {
  console.log(`Processing image file: ${file.name}`);
  
  const ocr = OcrFactory.getProvider(ocrProviderName);
  const result = await ocr.extractText(
    file,
    (p) => {
      // Scale OCR progress from 10% to 90%
      const scaledProgress = 10 + Math.floor(p * 0.8);
      onProgressUpdate(Math.min(scaledProgress, 90));
    },
    ocrLanguage
  );
  
  console.log(`Image OCR complete. Extracted text: ${result.text.length} characters`);
  
  return { 
    text: result.text,
    detectedLanguage: ocrLanguage === 'auto' ? result.detectedLanguage : undefined
  };
}
