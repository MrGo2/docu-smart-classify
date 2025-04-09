
import { createWorker } from "tesseract.js";

/**
 * Performs OCR on an image or PDF file
 */
export const performOcr = async (
  file: File, 
  onProgressUpdate: (progress: number) => void
): Promise<string> => {
  try {
    onProgressUpdate(10);
    
    // Create worker with Tesseract.js v4 configuration
    const worker = await createWorker({
      logger: progress => {
        console.log('OCR Progress:', progress);
      }
    });
    
    onProgressUpdate(20);
    
    // Initialize the worker with language
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    onProgressUpdate(30);
    
    // Handle different file types
    if (file.type === 'application/pdf') {
      // In a real implementation, you'd use PDF.js or similar to extract text
      // This is a simplified version for the demo
      console.log("Processing PDF file");
      const pdfText = "PDF text extraction placeholder - in a real app, you would use PDF.js to extract text from all pages";
      await worker.terminate();
      onProgressUpdate(70);
      return pdfText;
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
          console.log("Processing image data...");
          
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
