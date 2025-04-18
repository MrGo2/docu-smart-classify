export type OcrLanguage =
  | "eng" // English
  | "spa" // Spanish (Castilian)
  | "fra" // French
  | "deu" // German
  | "ita" // Italian
  | "por" // Portuguese
  | "cat" // Catalan
  | "eus" // Basque
  | "glg" // Galician
  | "auto"; // Automatic detection

export interface OcrBlock {
  text: string;
  confidence: number;
  box?: number[];
}

export interface OcrResult {
  text: string;
  confidence: number;
  language: OcrLanguage;
  detectedLanguage?: OcrLanguage;
  blocks?: OcrBlock[];
}

export interface OcrOptions {
  paddleOptions?: Record<string, any>;
  tesseractOptions?: Record<string, any>;
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
  supportsFileType(fileType: string): boolean;
  getSupportedFileTypes(): string[];
  dispose(): Promise<void>;
}
