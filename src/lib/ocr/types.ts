export type OcrLanguage =
  | "eng"
  | "spa"
  | "fra"
  | "deu"
  | "ita"
  | "por"
  | "rus"
  | "chi_sim"
  | "chi_tra"
  | "jpn"
  | "kor"
  | "auto";

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
