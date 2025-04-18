
import { createWorker } from "tesseract.js";
import { OcrLanguage, OcrOptions, OcrProvider, OcrResult } from "../types";

export class TesseractProvider implements OcrProvider {
  name = "tesseract";
  supportedLanguages: OcrLanguage[] = ["eng", "spa"];
  
  async extractText(
    file: File,
    onProgressUpdate: (progress: number) => void,
    language: OcrLanguage = "spa",
    options?: OcrOptions
  ): Promise<OcrResult> {
    try {
      // Initialize the Tesseract worker with the proper options object
      const worker = await createWorker({
        logger: progress => {
          // The progress object has a .progress property between 0-1
          if (progress.progress !== undefined) {
            onProgressUpdate(Math.floor(progress.progress * 100));
          }
        }
      });

      // Load the language data
      await worker.loadLanguage(language);
      await worker.initialize(language);
      
      // Convert file to image data URL
      const imageData = await this.fileToImage(file);
      
      // Perform OCR
      const result = await worker.recognize(imageData);
      
      // Clean up
      await worker.terminate();
      
      return {
        text: result.data.text,
        confidence: result.data.confidence,
        language: language
      };
    } catch (error) {
      console.error("Tesseract OCR error:", error);
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // Add the missing methods required by OcrProvider interface
  supportsFileType(fileType: string): boolean {
    return fileType.startsWith('image/');
  }
  
  getSupportedFileTypes(): string[] {
    return ['image/jpeg', 'image/png', 'image/tiff', 'image/bmp', 'image/gif'];
  }
  
  async dispose(): Promise<void> {
    // No specific cleanup needed for Tesseract provider
    // but we implement the method to satisfy the interface
    return Promise.resolve();
  }

  private async fileToImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
