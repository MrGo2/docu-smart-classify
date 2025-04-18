
import { OcrLanguage, OcrOptions, OcrResult } from "@/lib/ocr/types";
import { OcrProviderInterface } from "@/lib/core/interfaces/OcrProviderInterface";

/**
 * Abstract base class for all OCR implementations
 */
export abstract class AbstractOcrProvider implements OcrProviderInterface {
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
   * Create a new AbstractOcrProvider
   * 
   * @param id Provider ID
   * @param name Display name
   * @param supportedLanguages Array of supported languages
   */
  constructor(id: string, name: string, supportedLanguages: OcrLanguage[]) {
    this.id = id;
    this.name = name;
    this.supportedLanguages = supportedLanguages;
  }

  /**
   * Extract text from a file using OCR
   * 
   * @param file The file to extract text from
   * @param onProgressUpdate Callback for reporting progress (0-100)
   * @param language Language to use for OCR processing
   * @param options Additional options for OCR processing
   * @returns The extracted text and metadata
   */
  abstract extractText(
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
  abstract supportsFileType(fileType: string): boolean;
  
  /**
   * Get a list of all file types supported by this provider
   * 
   * @returns Array of supported MIME types
   */
  abstract getSupportedFileTypes(): string[];
}
