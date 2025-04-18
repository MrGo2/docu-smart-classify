
import { OcrLanguage, OcrOptions, OcrProvider, OcrResult } from "../types";
import * as paddleOcr from '@paddle-js-models/ocr';

export class PaddleOcrProvider implements OcrProvider {
  name = "paddleocr";
  supportedLanguages: OcrLanguage[] = ["eng", "spa", "auto"];
  private modelLoaded = false;
  private modelLoading = false;
  private ocrInstance: any = null;
  
  /**
   * Extract text from an image file using PaddleOCR
   * 
   * @param file The file to extract text from
   * @param onProgressUpdate Callback for reporting progress (0-100)
   * @param language Language to use for OCR processing, 'auto' for automatic detection
   * @param options Additional options for OCR processing
   * @returns The extracted text and metadata
   */
  async extractText(
    file: File,
    onProgressUpdate: (progress: number) => void,
    language: OcrLanguage = "auto",
    options?: OcrOptions
  ): Promise<OcrResult> {
    try {
      // Update progress to indicate we're starting
      onProgressUpdate(10);
      
      // Load the OCR model if not already loaded
      if (!this.modelLoaded) {
        if (!this.modelLoading) {
          this.modelLoading = true;
          onProgressUpdate(20);
          
          // Initialize PaddleOCR
          if (!this.ocrInstance) {
            // Using the correct API based on paddleOcr's available methods
            this.ocrInstance = await paddleOcr.load({
              wasmPath: 'https://cdn.jsdelivr.net/npm/@paddle-js-models/ocr/dist/paddle-ocr-wasm/',
              detPath: 'https://cdn.jsdelivr.net/npm/@paddle-js-models/ocr/dist/assets/ppocr_det/',
              recPath: 'https://cdn.jsdelivr.net/npm/@paddle-js-models/ocr/dist/assets/ppocr_rec/',
            });
          }
          
          this.modelLoaded = true;
          this.modelLoading = false;
        } else {
          // If model is currently loading, wait until it's loaded
          while (this.modelLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
      
      onProgressUpdate(30);
      
      // Convert file to image data
      const imageData = await this.fileToImage(file);
      
      onProgressUpdate(50);
      
      let detectedLanguage = language;
      
      // Automatically detect language if set to 'auto'
      if (language === 'auto') {
        try {
          // Since language detection might not be directly available in the API
          // We'll make a best effort based on the first few words of the OCR result
          const initialRecognition = await this.ocrInstance.recognize(imageData);
          
          // Simple language detection based on common Spanish words
          if (initialRecognition && initialRecognition.text) {
            const text = initialRecognition.text.toLowerCase();
            const spanishIndicators = ['el', 'la', 'los', 'las', 'y', 'de', 'en', 'con', 'por', 'para'];
            const englishIndicators = ['the', 'a', 'of', 'in', 'to', 'and', 'for', 'with', 'by'];
            
            let spanishCount = 0;
            let englishCount = 0;
            
            const words = text.split(/\s+/);
            for (const word of words) {
              if (spanishIndicators.includes(word)) spanishCount++;
              if (englishIndicators.includes(word)) englishCount++;
            }
            
            // Determine language based on word frequency
            if (spanishCount > englishCount) {
              detectedLanguage = 'spa';
            } else {
              detectedLanguage = 'eng';
            }
          } else {
            // Default to English if detection fails
            detectedLanguage = 'eng';
          }
        } catch (error) {
          console.warn("Language detection failed, defaulting to English:", error);
          detectedLanguage = 'eng';
        }
      }
      
      onProgressUpdate(60);
      
      // Prepare recognition options
      const recognitionOptions = {
        language: detectedLanguage === 'spa' ? 'es' : 'en',
        enableGPU: false, // Default to CPU for compatibility
        ...options?.paddleOptions
      };
      
      // Perform OCR on the image with the configured options
      const result = await this.ocrInstance.recognize(imageData, recognitionOptions);
      
      onProgressUpdate(90);
      
      // Extract and format text from OCR result
      const extractedText = this.formatOcrResults(result);
      
      onProgressUpdate(100);
      
      return {
        text: extractedText,
        confidence: this.calculateConfidence(result),
        language: detectedLanguage,
        detectedLanguage: language === 'auto' ? detectedLanguage : undefined
      };
    } catch (error) {
      console.error("PaddleOCR error:", error);
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      // Clean up resources after processing
      // Note: We're intentionally not disposing the model after each use
      // as it would be inefficient to reload it for each document
    }
  }
  
  /**
   * Check if a specific file type is supported by this OCR provider
   */
  supportsFileType(fileType: string): boolean {
    return fileType.startsWith('image/');
  }
  
  /**
   * Get a list of all file types supported by this provider
   */
  getSupportedFileTypes(): string[] {
    return ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/webp'];
  }
  
  /**
   * Clean up resources when provider is no longer needed
   */
  async dispose(): Promise<void> {
    if (this.modelLoaded && this.ocrInstance) {
      // Clean up any resources if needed
      this.ocrInstance = null;
      this.modelLoaded = false;
    }
  }
  
  /**
   * Convert file to image data URL
   */
  private async fileToImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      img.src = url;
    });
  }
  
  /**
   * Format OCR results into a single text string
   */
  private formatOcrResults(result: any): string {
    if (!result || !result.text) {
      return '';
    }
    
    return result.text;
  }
  
  /**
   * Calculate average confidence from OCR results
   */
  private calculateConfidence(result: any): number {
    if (!result || !result.score) {
      return 0;
    }
    
    return result.score;
  }
}
