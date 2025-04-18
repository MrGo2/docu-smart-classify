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
  eng: 'en', // English
  spa: 'es', // Spanish (Castilian)
  fra: 'fr', // French
  deu: 'de', // German
  ita: 'it', // Italian
  por: 'pt', // Portuguese
  cat: 'ca', // Catalan
  eus: 'eu', // Basque
  glg: 'gl', // Galician
  auto: 'en'  // Default to English for initial detection
};

// Language families for better detection
const LANGUAGE_FAMILIES = {
  iberian: ['spa', 'cat', 'eus', 'glg', 'por'],
  romance: ['spa', 'fra', 'ita', 'por', 'cat', 'glg'],
  germanic: ['eng', 'deu'],
};

const OCR_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  confidenceThreshold: 0.5,
  lineBreakThreshold: 20,
  textCleanupPatterns: [
    { pattern: /\s+/g, replacement: ' ' },
    { pattern: /[^\S\n]+$/gm, replacement: '' },
    { pattern: /^\s+/gm, replacement: '' },
    { pattern: /\n{3,}/g, replacement: '\n\n' }
  ],
  cacheSize: 5,
  minTextLength: 10,
  // Language detection configuration
  languageDetection: {
    minTextLength: 20, // Minimum text length for reliable language detection
    confidenceThreshold: 0.6, // Minimum confidence for language detection
    fallbackLanguage: 'eng',
    // Common words and patterns for additional language validation
    languagePatterns: {
      spa: /(?:el|la|los|las|de|en|que|por|con|para|está|este|esta|estos|estas)/i,
      cat: /(?:el|la|els|les|de|en|què|per|amb|està|aquest|aquesta|aquests|aquestes)/i,
      glg: /(?:o|a|os|as|de|en|que|por|con|para|está|este|esta|estes|estas)/i,
      eus: /(?:bat|da|dira|dute|nahi|eta|ere|ez|du|dugu|zuen|zen)/i,
      por: /(?:o|a|os|as|de|em|que|por|com|para|está|este|esta|estes|estas)/i
    }
  }
};

export class PaddleOcrProvider implements OcrProvider {
  name = "paddleocr";
  supportedLanguages: OcrLanguage[] = Object.keys(LANGUAGE_MAP) as OcrLanguage[];
  private engineManager = new OcrEngineManager();
  private cache = new Map<string, { result: PaddleOcrBlock[]; timestamp: number }>();
  
  async extractText(
    file: File,
    onProgressUpdate: (progress: number) => void,
    language: OcrLanguage = "auto",
    options?: OcrOptions
  ): Promise<OcrResult> {
    try {
      onProgressUpdate(10);
      console.log(`PaddleOCR: Starting text extraction with language: ${language}`);
      
      // Initialize engine with proper error handling
      let engine;
      try {
        engine = await this.engineManager.getEngine();
        onProgressUpdate(30);
        console.log("PaddleOCR: Engine loaded successfully");
      } catch (error) {
        console.error("PaddleOCR: Engine initialization failed:", error);
        throw new Error(`OCR engine initialization failed: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Load and process image
      let imageData;
      try {
        imageData = await fileToImage(file);
        onProgressUpdate(50);
        console.log("PaddleOCR: Image loaded and processed successfully");
      } catch (error) {
        console.error("PaddleOCR: Image loading failed:", error);
        throw new Error(`Image loading failed: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      const imageKey = imageData.src;
      let detectedLanguage = language;
      let recognitionResult: PaddleOcrBlock[] | null = null;
      
      // Check cache with timestamp validation (5 minutes)
      const cached = this.cache.get(imageKey);
      const isCacheValid = cached && (Date.now() - cached.timestamp) < 300000;
      
      if (isCacheValid) {
        console.log("PaddleOCR: Using cached recognition result");
        recognitionResult = cached.result;
      } else {
        try {
          console.log("PaddleOCR: Performing recognition");
          recognitionResult = await this.performRecognition(engine, imageData, LANGUAGE_MAP[language]);
          
          // Cache the result if it contains meaningful text
          const extractedText = this.extractTextFromBlocks(recognitionResult);
          if (extractedText.length >= OCR_CONFIG.minTextLength) {
            this.updateCache(imageKey, recognitionResult);
          }
        } catch (error) {
          console.error("PaddleOCR: Recognition failed:", error);
          throw new Error(`Text recognition failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      onProgressUpdate(70);
      
      // Language detection with error handling
      if (language === 'auto' && recognitionResult) {
        try {
          const extractedText = this.extractTextFromBlocks(recognitionResult);
          if (extractedText.length > 0) {
            const detection = await this.detectTextLanguage(extractedText);
            detectedLanguage = detection.language;
            console.log(`PaddleOCR: Detected language: ${detectedLanguage} with confidence: ${detection.confidence}`);
          } else {
            console.log("PaddleOCR: No text detected for language detection, using fallback");
            detectedLanguage = OCR_CONFIG.languageDetection.fallbackLanguage as OcrLanguage;
          }
        } catch (error) {
          console.warn("PaddleOCR: Language detection failed, using fallback:", error);
          detectedLanguage = OCR_CONFIG.languageDetection.fallbackLanguage as OcrLanguage;
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
      // Clean up resources on error
      await this.dispose().catch(e => console.warn("Cleanup failed:", e));
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
        
        // Validate result structure
        const isValidResult = result.every(block => 
          typeof block === 'object' && 
          (typeof block.text === 'string' || Array.isArray(block.words))
        );
        
        if (!isValidResult) {
          throw new Error("Invalid block structure in recognition result");
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
      
      // Group blocks into lines based on vertical position
      let currentLine = 0;
      let lastY = -1;
      
      return sortedBlocks.map((block, index) => {
        const confidence = this.calculateBlockConfidence(block);
        const text = this.cleanupText(
          block.text || 
          (block.words?.map(w => typeof w === 'string' ? w : w.text).join(' ') || '')
        );
        
        if (block.box) {
          const currentY = (block.box[1] + block.box[5]) / 2;
          if (lastY >= 0 && Math.abs(currentY - lastY) > OCR_CONFIG.lineBreakThreshold) {
            currentLine++;
          }
          lastY = currentY;
        } else {
          currentLine = index;
        }
        
        return {
          text,
          confidence,
          box: block.box,
          lineNumber: currentLine
        };
      });
    } catch (error) {
      console.warn("Block processing error:", error);
      return blocks.map((block, index) => ({
        text: block.text || '',
        confidence: block.score || 0,
        box: block.box,
        lineNumber: index
      }));
    }
  }
  
  private calculateBlockConfidence(block: PaddleOcrBlock): number {
    if (typeof block.score === 'number') {
      return block.score;
    }
    
    if (block.words?.length) {
      const scores = block.words
        .map(word => typeof word === 'object' && typeof word.score === 'number' ? word.score : 0)
        .filter(score => score > 0);
      
      return scores.length ? scores.reduce((a, b) => a + b) / scores.length : 0;
    }
    
    return 0;
  }
  
  private cleanupText(text: string): string {
    return OCR_CONFIG.textCleanupPatterns.reduce(
      (result, { pattern, replacement }) => result.replace(pattern, replacement),
      text
    );
  }
  
  private combineProcessedBlocks(blocks: ProcessedBlock[]): string {
    if (!blocks.length) return '';
    
    const lineGroups = new Map<number, ProcessedBlock[]>();
    blocks.forEach(block => {
      const line = lineGroups.get(block.lineNumber) || [];
      line.push(block);
      lineGroups.set(block.lineNumber, line);
    });
    
    // Sort blocks within each line by horizontal position
    lineGroups.forEach(line => {
      line.sort((a, b) => {
        if (a.box && b.box) {
          return (a.box[0] + a.box[4]) / 2 - (b.box[0] + b.box[4]) / 2;
        }
        return 0;
      });
    });
    
    // Combine lines with proper spacing
    return Array.from(lineGroups.keys())
      .sort((a, b) => a - b)
      .map(lineNumber => {
        const line = lineGroups.get(lineNumber) || [];
        return line.map(block => block.text).join(' ');
      })
      .join('\n')
      .trim();
  }
  
  private calculateAverageConfidence(blocks: ProcessedBlock[]): number {
    if (!blocks.length) return 0;
    const validConfidences = blocks
      .map(block => block.confidence)
      .filter(confidence => confidence > 0);
    return validConfidences.length ? 
      validConfidences.reduce((a, b) => a + b) / validConfidences.length : 0;
  }
  
  private updateCache(key: string, result: PaddleOcrBlock[]): void {
    // Remove oldest entries if cache is too large
    if (this.cache.size >= OCR_CONFIG.cacheSize) {
      const oldest = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0];
      if (oldest) {
        this.cache.delete(oldest[0]);
      }
    }
    
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
  }
  
  supportsFileType(fileType: string): boolean {
    return fileType.startsWith('image/');
  }
  
  getSupportedFileTypes(): string[] {
    return ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];
  }
  
  async dispose(): Promise<void> {
    try {
      // Clear the cache
      this.cache.clear();
      
      // Dispose the engine manager
      await this.engineManager.dispose();
    } catch (error) {
      console.warn("Error during OCR provider cleanup:", error);
    }
  }

  private async detectTextLanguage(text: string): Promise<{ language: OcrLanguage; confidence: number }> {
    if (text.length < OCR_CONFIG.languageDetection.minTextLength) {
      console.log("Text too short for reliable language detection, using fallback");
      return { language: OCR_CONFIG.languageDetection.fallbackLanguage as OcrLanguage, confidence: 0 };
    }

    try {
      // Get initial language detection
      const detection = detectLanguageFromText(text);
      let detectedLanguage = detection.language as OcrLanguage;
      let confidence = detection.confidence;

      // Additional validation for similar languages
      if (LANGUAGE_FAMILIES.iberian.includes(detectedLanguage)) {
        // Validate Spanish regional languages with specific patterns
        const patterns = OCR_CONFIG.languageDetection.languagePatterns;
        const matches = {
          spa: (patterns.spa.test(text) ? 1 : 0),
          cat: (patterns.cat.test(text) ? 1 : 0),
          glg: (patterns.glg.test(text) ? 1 : 0),
          eus: (patterns.eus.test(text) ? 1 : 0),
          por: (patterns.por.test(text) ? 1 : 0)
        };

        // Find the language with the most pattern matches
        const bestMatch = Object.entries(matches)
          .reduce((best, [lang, score]) => 
            score > best.score ? { lang, score } : best,
            { lang: detectedLanguage, score: 0 }
          );

        if (bestMatch.score > 0) {
          detectedLanguage = bestMatch.lang as OcrLanguage;
          // Adjust confidence based on pattern matching
          confidence = Math.min(1, confidence + (bestMatch.score * 0.1));
        }
      }

      // If confidence is too low, fall back to default
      if (confidence < OCR_CONFIG.languageDetection.confidenceThreshold) {
        console.log(`Low confidence (${confidence}) in language detection, using fallback`);
        return { 
          language: OCR_CONFIG.languageDetection.fallbackLanguage as OcrLanguage, 
          confidence: confidence 
        };
      }

      return { language: detectedLanguage, confidence };
    } catch (error) {
      console.warn("Language detection failed:", error);
      return { 
        language: OCR_CONFIG.languageDetection.fallbackLanguage as OcrLanguage, 
        confidence: 0 
      };
    }
  }
}
