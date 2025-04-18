
export type OcrLanguage = 'spa' | 'eng' | 'auto';

export interface OcrResult {
  text: string;
  confidence?: number;
  language?: string;
  detectedLanguage?: OcrLanguage; // Added field for auto-detected language
}

export interface OcrProvider {
  name: string;
  supportedLanguages: OcrLanguage[];
  
  extractText(
    file: File,
    onProgressUpdate: (progress: number) => void,
    language?: OcrLanguage,
    options?: OcrOptions
  ): Promise<OcrResult>;
  
  // Optional method for cleanup
  dispose?: () => Promise<void>;
}

export interface OcrOptions {
  format?: 'text' | 'json' | 'markdown';
  customPrompt?: string;
  paddleOptions?: Record<string, any>; // Additional options specific to PaddleOCR
}
