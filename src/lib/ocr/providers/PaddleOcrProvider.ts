
import { OcrLanguage, OcrOptions, OcrProvider, OcrResult } from "../types";
import { fileToImage } from "../utils/imageProcessing";
import { detectLanguageFromText } from "../utils/languageDetection";
import { OcrEngineManager } from "../engine/OcrEngineManager";

export class PaddleOcrProvider implements OcrProvider {
  name = "paddleocr";
  supportedLanguages: OcrLanguage[] = ["eng", "spa", "auto"];
  private engineManager = new OcrEngineManager();
  
  async extractText(
    file: File,
    onProgressUpdate: (progress: number) => void,
    language: OcrLanguage = "auto",
    options?: OcrOptions
  ): Promise<OcrResult> {
    try {
      onProgressUpdate(10);
      
      const engine = await this.engineManager.getEngine();
      onProgressUpdate(30);
      
      const imageData = await fileToImage(file);
      onProgressUpdate(50);
      
      let detectedLanguage = language;
      
      if (language === 'auto') {
        try {
          const initialRecognition = await engine.detectText(imageData);
          
          if (initialRecognition && initialRecognition.text) {
            const detection = detectLanguageFromText(initialRecognition.text);
            detectedLanguage = detection.language;
          } else {
            detectedLanguage = 'eng';
          }
        } catch (error) {
          console.warn("Language detection failed, defaulting to English:", error);
          detectedLanguage = 'eng';
        }
      }
      
      onProgressUpdate(60);
      
      const recognitionOptions = {
        language: detectedLanguage === 'spa' ? 'es' : 'en',
        enableGPU: false,
        ...options?.paddleOptions
      };
      
      const result = await engine.detectText(imageData, recognitionOptions);
      onProgressUpdate(90);
      
      return {
        text: result.text || '',
        confidence: result.score || 0,
        language: detectedLanguage,
        detectedLanguage: language === 'auto' ? detectedLanguage : undefined
      };
    } catch (error) {
      console.error("PaddleOCR error:", error);
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  supportsFileType(fileType: string): boolean {
    return fileType.startsWith('image/');
  }
  
  getSupportedFileTypes(): string[] {
    return ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/webp'];
  }
  
  async dispose(): Promise<void> {
    this.engineManager.dispose();
  }
}
