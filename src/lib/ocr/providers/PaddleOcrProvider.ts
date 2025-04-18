
import { OcrLanguage, OcrOptions, OcrProvider, OcrResult } from "../types";
import * as paddleOcr from '@paddle-js-models/ocr';

export class PaddleOcrProvider implements OcrProvider {
  name = "paddleocr";
  supportedLanguages: OcrLanguage[] = ["eng", "spa", "auto"];
  private modelLoaded = false;
  private modelLoading = false;
  
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
          await paddleOcr.createOCRInstance();
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
          // Use PaddleOCR's language detection
          const detector = await paddleOcr.createLangDetector();
          const langResult = await detector.detect(imageData);
          
          // Map detected language code to our supported languages
          if (langResult && langResult.language) {
            // PaddleOCR returns language codes like 'en', 'es', etc.
            if (langResult.language.startsWith('en')) {
              detectedLanguage = 'eng';
            } else if (langResult.language.startsWith('es')) {
              detectedLanguage = 'spa';
            } else {
              // Default to English if language is not supported
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
      
      // Create OCR instance with appropriate options
      const ocr = await paddleOcr.createOCRInstance({
        // Map our language codes to PaddleOCR format
        language: detectedLanguage === 'spa' ? 'es' : 'en',
        enableGPU: false, // Default to CPU for compatibility
        ...options?.paddleOptions
      });
      
      // Perform OCR on the image
      const result = await ocr.recognize(imageData);
      
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
    if (this.modelLoaded) {
      // PaddleOCR doesn't have a direct dispose method like Tesseract
      // We'll just set our flag to indicate it's not loaded
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
