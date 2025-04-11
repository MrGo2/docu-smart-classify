
export type OcrLanguage = 'spa' | 'eng';

export interface OcrResult {
  text: string;
  confidence?: number;
  language?: string;
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
}

export interface OcrOptions {
  format?: 'text' | 'json' | 'markdown';
  customPrompt?: string;
}
