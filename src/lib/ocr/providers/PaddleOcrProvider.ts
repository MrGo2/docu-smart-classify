import { OcrLanguage, OcrOptions, OcrProvider, OcrResult, OcrBlock } from "../types";
import { fileToImage } from "../utils/imageProcessing";
import { detectLanguageFromText } from "../utils/languageDetection";
import { OcrEngineManager } from "../engine/OcrEngineManager";

interface PaddleOcrBlock {
  text?: string;
  words?: Array<{ text: string; score?: number }>;
  score?: number;
  box?: number[];
  direction?: number;
  angle?: number;
}

interface ProcessedBlock {
  text: string;
  confidence: number;
  box?: number[];
  lineNumber: number;
}

const LANGUAGE_MAP: Record<OcrLanguage, string> = {
  eng: 'en',
  spa: 'es',
  fra: 'fr',
  deu: 'de',
  ita: 'it',
  por: 'pt',
  rus: 'ru',
  chi_sim: 'ch',
  chi_tra: 'ch',
  jpn: 'ja',
  kor: 'ko',
  auto: 'en' // Default language for initial detection
};

const OCR_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  confidenceThreshold: 0.5,
  lineBreakThreshold: 20, // pixels
  textCleanupPatterns: [
    { pattern: /\s+/g, replacement: ' ' }, // Normalize whitespace
    { pattern: /[^\S\n]+$/gm, replacement: '' }, // Remove trailing spaces
    { pattern: /^\s+/gm, replacement: '' }, // Remove leading spaces
    { pattern: /\n{3,}/g, replacement: '\n\n' } // Normalize multiple line breaks
  ]
};

export class PaddleOcrProvider implements OcrProvider {
  name = "paddleocr";
  supportedLanguages: OcrLanguage[] = Object.keys(LANGUAGE_MAP) as OcrLanguage[];
  private engineManager = new OcrEngineManager();
  private lastProcessedImage: string | null = null;
  private lastRecognitionResult: PaddleOcrBlock[] | null = null;
  
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
      const imageKey = imageData.src;
      onProgressUpdate(50);
      console.log("PaddleOCR: Image loaded and processed successfully");
      
      let detectedLanguage = language;
      let recognitionResult: PaddleOcrBlock[] | null = null;
      
      // Check if we can reuse the last recognition result
      if (this.lastProcessedImage === imageKey && this.lastRecognitionResult) {
        console.log("PaddleOCR: Reusing cached recognition result");
        recognitionResult = this.lastRecognitionResult;
      } else {
        // Perform initial recognition
        try {
          console.log("PaddleOCR: Performing recognition");
          recognitionResult = await this.performRecognition(engine, imageData, LANGUAGE_MAP[language]);
          
          // Cache the result
          this.lastProcessedImage = imageKey;
          this.lastRecognitionResult = recognitionResult;
        } catch (error) {
          console.error("PaddleOCR: Recognition failed:", error);
          throw error;
        }
      }
      
      onProgressUpdate(70);
      
      // Detect language if needed
      if (language === 'auto' && recognitionResult) {
        const extractedText = this.extractTextFromBlocks(recognitionResult);
        if (extractedText.length > 0) {
          const detection = detectLanguageFromText(extractedText);
          detectedLanguage = detection.language;
          console.log(`PaddleOCR: Detected language: ${detectedLanguage} with confidence: ${detection.confidence}`);
        } else {
          console.log("PaddleOCR: No text detected for language detection, defaulting to English");
          detectedLanguage = 'eng';
        }
      }
      
      onProgressUpdate(90);
      
      // Process and return the final result
      const processedBlocks = this.processBlocks(recognitionResult || []);
      const finalText = this.combineProcessedBlocks(processedBlocks);
      const confidence = this.calculateAverageConfidence(processedBlocks);
      
      const blocks: OcrBlock[] = processedBlocks.map(block => ({
        text: block.text,
        confidence: block.confidence,
        box: block.box
      }));
      
      return {
        text: finalText,
        confidence,
        language: detectedLanguage,
        detectedLanguage: language === 'auto' ? detectedLanguage : undefined,
        blocks
      };
    } catch (error) {
      console.error("PaddleOCR error:", error);
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  private async performRecognition(
    engine: any,
    imageData: HTMLImageElement,
    language: string,
    retries = OCR_CONFIG.maxRetries
  ): Promise<PaddleOcrBlock[]> {
    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`PaddleOCR: Retry attempt ${attempt} of ${retries}`);
          await new Promise(resolve => setTimeout(resolve, OCR_CONFIG.retryDelay * attempt));
        }
        
        const result = await engine.recognize(imageData, { language });
        
        if (!result || !Array.isArray(result)) {
          throw new Error("Invalid recognition result structure");
        }
        
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`PaddleOCR: Recognition attempt ${attempt + 1} failed:`, error);
      }
    }
    
    throw lastError || new Error("Recognition failed after all retry attempts");
  }
  
  private extractTextFromBlocks(blocks: PaddleOcrBlock[]): string {
    return blocks
      .map(block => {
        if (typeof block.text === 'string') {
          return block.text;
        } else if (block.words?.length) {
          return block.words
            .map(word => typeof word === 'string' ? word : word.text)
            .filter(Boolean)
            .join(' ');
        }
        return '';
      })
      .filter(Boolean)
      .join(' ');
  }
  
  private processBlocks(blocks: PaddleOcrBlock[]): ProcessedBlock[] {
    if (!blocks || !Array.isArray(blocks)) {
      return [];
    }
    
    try {
      // Sort blocks by vertical position
      const sortedBlocks = [...blocks].sort((a, b) => {
        if (a.box && b.box) {
          return (a.box[1] + a.box[5]) / 2 - (b.box[1] + b.box[5]) / 2;
        }
        return 0;
      });
      
      let currentLineNumber = 0;
      let lastY: number | null = null;
      
      return sortedBlocks
        .map(block => {
          if (!block) return null;
          
          // Extract text
          let text = '';
          if (typeof block.text === 'string') {
            text = block.text;
          } else if (block.words?.length) {
            text = block.words
              .map(word => typeof word === 'string' ? word : word.text)
              .filter(Boolean)
              .join(' ');
          }
          
          if (!text.trim()) return null;
          
          // Calculate confidence
          const confidence = this.calculateBlockConfidence(block);
          
          // Determine line number based on vertical position
          if (block.box) {
            const currentY = (block.box[1] + block.box[5]) / 2;
            if (lastY === null || Math.abs(currentY - lastY) > OCR_CONFIG.lineBreakThreshold) {
              currentLineNumber++;
            }
            lastY = currentY;
          }
          
          return {
            text: this.cleanupText(text),
            confidence,
            box: block.box,
            lineNumber: currentLineNumber
          } as ProcessedBlock;
        })
        .filter((block): block is ProcessedBlock => 
          block !== null && 
          typeof block === 'object' && 
          typeof block.text === 'string' && 
          typeof block.confidence === 'number' && 
          typeof block.lineNumber === 'number'
        );
    } catch (error) {
      console.error("PaddleOCR: Error processing blocks:", error);
      return [];
    }
  }
  
  private calculateBlockConfidence(block: PaddleOcrBlock): number {
    let totalConfidence = 0;
    let count = 0;
    
    // Add block-level confidence
    if (typeof block.score === 'number') {
      totalConfidence += block.score;
      count++;
    }
    
    // Add word-level confidences
    if (block.words?.length) {
      for (const word of block.words) {
        if (typeof word === 'object' && word.score !== undefined) {
          totalConfidence += word.score;
          count++;
        }
      }
    }
    
    return count > 0 ? (totalConfidence / count) * 100 : 0;
  }
  
  private cleanupText(text: string): string {
    let cleaned = text;
    for (const { pattern, replacement } of OCR_CONFIG.textCleanupPatterns) {
      cleaned = cleaned.replace(pattern, replacement);
    }
    return cleaned;
  }
  
  private combineProcessedBlocks(blocks: ProcessedBlock[]): string {
    const lineGroups = new Map<number, ProcessedBlock[]>();
    
    // Group blocks by line number
    blocks.forEach(block => {
      if (!lineGroups.has(block.lineNumber)) {
        lineGroups.set(block.lineNumber, []);
      }
      lineGroups.get(block.lineNumber)!.push(block);
    });
    
    // Combine blocks within each line and join lines
    return Array.from(lineGroups.entries())
      .sort(([a], [b]) => a - b)
      .map(([_, lineBlocks]) => 
        lineBlocks
          .sort((a, b) => {
            if (a.box && b.box) {
              return a.box[0] - b.box[0]; // Sort by x-coordinate
            }
            return 0;
          })
          .map(block => block.text)
          .join(' ')
      )
      .join('\n')
      .trim();
  }
  
  private calculateAverageConfidence(blocks: ProcessedBlock[]): number {
    if (blocks.length === 0) return 0;
    
    const totalConfidence = blocks.reduce((sum, block) => sum + block.confidence, 0);
    return totalConfidence / blocks.length;
  }
  
  supportsFileType(fileType: string): boolean {
    return fileType.startsWith('image/');
  }
  
  getSupportedFileTypes(): string[] {
    return ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/webp'];
  }
  
  async dispose(): Promise<void> {
    this.lastProcessedImage = null;
    this.lastRecognitionResult = null;
    await this.engineManager.dispose();
  }
}
