
import { OcrLanguage, OcrOptions, OcrResult } from "@/lib/ocr/types";

/**
 * Interface for all OCR (Optical Character Recognition) providers
 */
export interface OcrProviderInterface {
  /**
   * Unique identifier for the OCR provider
   */
  id: string;
  
  /**
   * Display name of the OCR provider
   */
  name: string;
  
  /**
   * List of languages supported by this OCR provider
   */
  supportedLanguages: OcrLanguage[];
  
  /**
   * Extract text from a file using OCR
   * 
   * @param file The file to extract text from
   * @param onProgressUpdate Callback for reporting progress (0-100)
   * @param language Language to use for OCR processing
   * @param options Additional options for OCR processing
   * @returns The extracted text and metadata
   */
  extractText(
    file: File,
    onProgressUpdate: (progress: number) => void,
    language?: OcrLanguage,
    options?: OcrOptions
  ): Promise<OcrResult>;
  
  /**
   * Check if a specific file type is supported by this OCR provider
   * 
   * @param fileType MIME type of the file
   * @returns Whether the file type is supported
   */
  supportsFileType(fileType: string): boolean;
}
