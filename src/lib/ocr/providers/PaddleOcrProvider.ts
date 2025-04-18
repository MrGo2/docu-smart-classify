
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
      console.log(`PaddleOCR: Starting text extraction with language: ${language}`);
      
      const engine = await this.engineManager.getEngine();
      onProgressUpdate(30);
      console.log("PaddleOCR: Engine loaded successfully");
      
      const imageData = await fileToImage(file);
      onProgressUpdate(50);
      console.log("PaddleOCR: Image loaded successfully");
      
      let detectedLanguage = language;
      
      if (language === 'auto') {
        try {
          console.log("PaddleOCR: Performing initial recognition for language detection");
          const initialRecognitionResult = await engine.recognize(imageData);
          const initialText = this.extractTextFromResults(initialRecognitionResult);
          
          if (initialText && initialText.length > 0) {
            const detection = detectLanguageFromText(initialText);
            detectedLanguage = detection.language;
            console.log(`PaddleOCR: Detected language: ${detectedLanguage} with confidence: ${detection.confidence}`);
          } else {
            console.log("PaddleOCR: Initial recognition didn't return text, defaulting to English");
            detectedLanguage = 'eng';
          }
        } catch (error) {
          console.warn("PaddleOCR: Language detection failed, defaulting to English:", error);
          detectedLanguage = 'eng';
        }
      }
      
      onProgressUpdate(60);
      
      const recognitionOptions = {
        language: detectedLanguage === 'spa' ? 'es' : 'en',
        ...options?.paddleOptions
      };
      
      console.log(`PaddleOCR: Running full recognition with options:`, recognitionOptions);
      const result = await engine.recognize(imageData, recognitionOptions);
      onProgressUpdate(85);
      
      const extractedText = this.extractTextFromResults(result);
      console.log(`PaddleOCR: Extraction complete. Text length: ${extractedText.length} characters`);
      
      onProgressUpdate(90);
      
      return {
        text: extractedText,
        confidence: this.calculateAverageConfidence(result),
        language: detectedLanguage,
        detectedLanguage: language === 'auto' ? detectedLanguage : undefined
      };
    } catch (error) {
      console.error("PaddleOCR error:", error);
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  private extractTextFromResults(result: any): string {
    // Check if result exists and has expected structure
    if (!result || !Array.isArray(result)) {
      console.warn("PaddleOCR: Unexpected result structure:", result);
      return "";
    }
    
    try {
      // Log the structure to understand what we're working with
      console.log("PaddleOCR: Result structure:", JSON.stringify(result).substring(0, 200) + "...");
      
      // Extract text from the result based on paddle-ocr's output format
      // This assumes result is an array of text blocks with 'text' property
      const textParts: string[] = [];
      
      for (const block of result) {
        if (typeof block === 'object' && block !== null) {
          // Handle different possible formats
          if ('text' in block && typeof block.text === 'string') {
            textParts.push(block.text);
          } else if ('words' in block && Array.isArray(block.words)) {
            for (const word of block.words) {
              if (typeof word === 'object' && word !== null && 'text' in word) {
                textParts.push(word.text);
              } else if (typeof word === 'string') {
                textParts.push(word);
              }
            }
          }
        } else if (typeof block === 'string') {
          textParts.push(block);
        }
      }
      
      // Join all extracted text parts
      return textParts.join(" ");
    } catch (error) {
      console.error("PaddleOCR: Error extracting text from results:", error);
      return "";
    }
  }
  
  private calculateAverageConfidence(result: any): number {
    if (!result || !Array.isArray(result) || result.length === 0) {
      return 0;
    }
    
    try {
      let totalConfidence = 0;
      let count = 0;
      
      for (const block of result) {
        if (typeof block === 'object' && block !== null && 'score' in block) {
          totalConfidence += Number(block.score);
          count++;
        }
      }
      
      return count > 0 ? totalConfidence / count : 0;
    } catch (error) {
      console.error("PaddleOCR: Error calculating average confidence:", error);
      return 0;
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
