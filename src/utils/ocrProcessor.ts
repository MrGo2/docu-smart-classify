
import { createWorker } from "tesseract.js";
import * as pdfjs from 'pdfjs-dist';

// Initialize pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export type OcrLanguage = 'spa' | 'eng';

/**
 * Performs OCR on an image or PDF file
 */
export const performOcr = async (
  file: File, 
  onProgressUpdate: (progress: number) => void,
  language: OcrLanguage = 'spa' // Default to Spanish
): Promise<string> => {
  try {
    onProgressUpdate(10);
    
    // Create worker with Tesseract.js configuration
    const worker = await createWorker({
      logger: progress => {
        console.log('OCR Progress:', progress);
      }
    });
    
    onProgressUpdate(20);
    
    // Initialize the worker with language
    await worker.loadLanguage(language);
    await worker.initialize(language);
    
    onProgressUpdate(30);
    
    // Handle different file types
    if (file.type === 'application/pdf') {
      return await extractTextFromPdf(file, worker, onProgressUpdate, language);
    } 
    
    // For images, use standard recognition
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          if (!event.target || !event.target.result) {
            throw new Error("Failed to read file");
          }
          
          const imageData = event.target.result as string;
          console.log(`Processing image data with ${language} language...`);
          
          // Recognize the text in the image
          const { data } = await worker.recognize(imageData);
          await worker.terminate();
          onProgressUpdate(70);
          
          console.log("OCR complete. Extracted text length:", data.text.length);
          resolve(data.text);
        } catch (error) {
          console.error("OCR processing error:", error);
          reject(new Error("Failed to extract text from the document"));
        }
      };
      
      reader.onerror = () => {
        reject(new Error("Failed to read the file"));
      };
      
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error("OCR error:", error);
    throw new Error("Failed to extract text from the document");
  }
};

/**
 * Extracts text from a PDF file, with special handling for scanned PDFs
 */
async function extractTextFromPdf(
  file: File, 
  worker: Tesseract.Worker,
  onProgressUpdate: (progress: number) => void,
  language: OcrLanguage = 'spa'
): Promise<string> {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const pdf = await pdfjs.getDocument(new Uint8Array(arrayBuffer)).promise;
    const numPages = pdf.numPages;
    console.log(`PDF loaded. Number of pages: ${numPages}`);
    
    onProgressUpdate(40);
    
    let fullText = '';
    
    // Extract text from each page
    for (let i = 1; i <= numPages; i++) {
      // Calculate progress - starting from 40% to 70%
      const pageProgress = 40 + Math.floor((i / numPages) * 30);
      onProgressUpdate(pageProgress);
      
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Extract text items
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      // If the page has very little or no text, it's likely a scanned page
      // We'll render it and use OCR
      if (pageText.trim().length < 50) {
        console.log(`Page ${i} appears to be scanned. Using OCR with ${language} language.`);
        
        // Render the PDF page to a canvas
        const viewport = page.getViewport({ scale: 1.5 }); // Higher scale for better OCR
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error("Failed to create canvas context");
        }
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        // Convert canvas to image data URL
        const imageDataUrl = canvas.toDataURL('image/png');
        
        // Use OCR on the rendered image
        const { data } = await worker.recognize(imageDataUrl);
        fullText += data.text + '\n\n';
      } else {
        fullText += pageText + '\n\n';
      }
      
      // Release page resources
      page.cleanup();
    }
    
    await worker.terminate();
    onProgressUpdate(70);
    console.log("PDF text extraction completed. Extracted text length:", fullText.length);
    
    return fullText;
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Failed to extract text from the PDF document");
  }
}

/**
 * Checks if a file needs OCR processing based on its extension
 */
export const needsOcr = (file: File): boolean => {
  const ext = getFileExtension(file.name);
  return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'pdf';
};

/**
 * Gets the file extension from a filename
 */
export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

/**
 * Get available OCR languages
 */
export const getAvailableOcrLanguages = (): { value: OcrLanguage; label: string }[] => {
  return [
    { value: 'spa', label: 'Spanish' },
    { value: 'eng', label: 'English' }
  ];
};
