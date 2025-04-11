
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
      // Initialize the Tesseract worker with the selected language
      const worker = await createWorker(language);
      
      // Set up progress monitoring
      worker.setProgressHandler((progress) => {
        onProgressUpdate(Math.floor(progress.progress * 100));
      });

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

  private async fileToImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
