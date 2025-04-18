
import { OcrLanguage } from "@/lib/ocr/types";
import { OcrFactory } from "@/lib/ocr/OcrFactory";
import { getDocument, GlobalWorkerOptions, PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

// Configure PDF.js worker
GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

// Memory-efficient canvas pool for PDF rendering
const canvasPool: HTMLCanvasElement[] = [];

const getCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = canvasPool.pop() || document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const releaseCanvas = (canvas: HTMLCanvasElement) => {
  // Clear the canvas before returning to pool
  const ctx = canvas.getContext("2d");
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
  canvasPool.push(canvas);
};

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
 * Performs OCR on a document with improved memory management and error handling
 */
export const performOcr = async (
  file: File,
  onProgressUpdate: (progress: number) => void,
  ocrLanguage: OcrLanguage = "auto",
  ocrProviderName: string = "paddleocr"
) => {
  try {
    onProgressUpdate(5);
    console.log(`Starting OCR for ${file.name} using ${ocrProviderName} with language: ${ocrLanguage}`);
    
    const result = file.type === "application/pdf"
      ? await processPdf(file, onProgressUpdate, ocrLanguage, ocrProviderName)
      : await processImage(file, onProgressUpdate, ocrLanguage, ocrProviderName);
    
    onProgressUpdate(100);
    return result;
  } catch (error) {
    console.error("OCR processing error:", error);
    throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Process a single PDF page with efficient resource management
 */
async function processPage(
  page: PDFPageProxy,
  pageNum: number,
  numPages: number,
  baseProgress: number,
  onProgressUpdate: (progress: number) => void,
  ocrLanguage: OcrLanguage,
  ocrProviderName: string
): Promise<{ text: string; detectedLanguage?: OcrLanguage }> {
  try {
    // Try direct text extraction first
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => "str" in item ? item.str : "")
      .join(" ");

    console.log(`Page ${pageNum}: Direct extraction found ${pageText.length} characters`);

    // If we have meaningful text content, use it (but use a stricter threshold)
    // Some PDFs report empty strings or just whitespace as valid text
    if (pageText.trim().length > 10) {
      return { text: pageText };
    } else {
      console.log(`Page ${pageNum}: Not enough text found (${pageText.length} chars), using OCR`);
    }
  } catch (error) {
    console.warn(`Direct text extraction failed for page ${pageNum}, falling back to OCR:`, error);
  }

  // Fall back to OCR
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = getCanvas(viewport.width, viewport.height);
  const context = canvas.getContext("2d")!;

  try {
    await page.render({ canvasContext: context, viewport }).promise;
    console.log(`Page ${pageNum}: Rendered to canvas for OCR (${canvas.width}x${canvas.height})`);
    
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), "image/png");
    });
    
    const pageFile = new File([blob], `page-${pageNum}.png`, { type: "image/png" });
    const ocr = OcrFactory.getProvider(ocrProviderName);
    
    console.log(`Page ${pageNum}: Starting OCR processing`);
    const result = await ocr.extractText(
      pageFile,
      (p) => {
        const scaledProgress = baseProgress + Math.floor(p * (80 / numPages));
        onProgressUpdate(Math.min(scaledProgress, 90));
      },
      ocrLanguage
    );

    console.log(`Page ${pageNum}: OCR extracted ${result.text.length} characters`);
    return result;
  } finally {
    releaseCanvas(canvas);
  }
}

/**
 * Process a PDF file using OCR if needed, with improved memory management
 */
async function processPdf(
  file: File,
  onProgressUpdate: (progress: number) => void,
  ocrLanguage: OcrLanguage,
  ocrProviderName: string
): Promise<{ text: string; detectedLanguage?: OcrLanguage }> {
  console.log(`PDF processing started for file: ${file.name} (${file.size} bytes)`);
  const arrayBuffer = await file.arrayBuffer();
  
  try {
    const pdfDocument = await getDocument({ data: arrayBuffer }).promise;
    const numPages = pdfDocument.numPages;
    
    console.log(`PDF loaded successfully. Total pages: ${numPages}`);
    
    const textContents: string[] = [];
    let detectedLanguage: OcrLanguage | undefined;
    
    // Process pages in batches to manage memory
    const BATCH_SIZE = 3;
    for (let i = 1; i <= numPages; i += BATCH_SIZE) {
      const batch = Array.from(
        { length: Math.min(BATCH_SIZE, numPages - i + 1) },
        (_, index) => i + index
      );
      
      console.log(`Processing PDF batch: pages ${batch[0]}-${batch[batch.length-1]}`);
      
      const batchResults = await Promise.all(
        batch.map(async (pageNum) => {
          const page = await pdfDocument.getPage(pageNum);
          const pageProgress = 10 + Math.floor((pageNum / numPages) * 80);
          
          try {
            return await processPage(
              page,
              pageNum,
              numPages,
              pageProgress,
              onProgressUpdate,
              ocrLanguage,
              ocrProviderName
            );
          } finally {
            // Clean up page object
            page.cleanup();
          }
        })
      );
      
      batchResults.forEach((result, index) => {
        textContents.push(result.text);
        if (batch[index] === 1 && ocrLanguage === 'auto' && result.detectedLanguage) {
          detectedLanguage = result.detectedLanguage;
        }
      });
    }
    
    // Clean up PDF document
    pdfDocument.cleanup();
    
    const fullText = textContents.join("\n\n=== PAGE BREAK ===\n\n");
    console.log(`PDF processing complete. Total extracted: ${fullText.length} characters`);
    return { text: fullText, detectedLanguage };
  } catch (error) {
    console.error(`PDF processing error for ${file.name}:`, error);
    throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Process an image file using OCR with improved error handling
 */
async function processImage(
  file: File,
  onProgressUpdate: (progress: number) => void,
  ocrLanguage: OcrLanguage,
  ocrProviderName: string
): Promise<{ text: string; detectedLanguage?: OcrLanguage }> {
  console.log(`Image processing started for file: ${file.name} (${file.size} bytes)`);
  const ocr = OcrFactory.getProvider(ocrProviderName);
  
  try {
    const result = await ocr.extractText(
      file,
      (p) => onProgressUpdate(10 + Math.floor(p * 80)),
      ocrLanguage
    );
    
    console.log(`Image OCR complete. Extracted: ${result.text.length} characters`);
    return {
      text: result.text,
      detectedLanguage: ocrLanguage === 'auto' ? result.detectedLanguage : undefined
    };
  } catch (error) {
    console.error(`Image OCR failed for ${file.name}:`, error);
    throw new Error(`Image OCR failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
