
import { OcrLanguage } from "@/lib/ocr/types";
import { ExtractionStrategy } from "@/lib/extraction/types";

/**
 * Interface for document processing workflows
 */
export interface DocumentProcessorInterface {
  /**
   * Process a document through the entire pipeline: OCR → extraction → classification → storage
   * 
   * @param file The document file to process
   * @param options Processing options
   * @param onProgressUpdate Callback for reporting progress (0-100)
   * @param onStatusUpdate Callback for status message updates
   * @returns Result of the processing operation
   */
  processDocument(
    file: File,
    options: DocumentProcessingOptions,
    onProgressUpdate: (progress: number) => void,
    onStatusUpdate: (status: string) => void
  ): Promise<DocumentProcessingResult>;
  
  /**
   * Check if a file type is supported by this processor
   * 
   * @param fileType MIME type of the file
   * @returns Whether the file type is supported
   */
  supportsFileType(fileType: string): boolean;
  
  /**
   * Get a list of all supported file types
   * 
   * @returns Array of supported MIME types
   */
  getSupportedFileTypes(): string[];
}

/**
 * Options for document processing
 */
export interface DocumentProcessingOptions {
  /**
   * Project ID to associate the document with
   */
  projectId?: string;
  
  /**
   * Language to use for OCR
   */
  ocrLanguage: OcrLanguage;
  
  /**
   * Strategy to use for text extraction
   */
  extractionStrategy: ExtractionStrategy;
  
  /**
   * AI model service to use for classification
   */
  classificationModel: string;
}

/**
 * Result of document processing
 */
export interface DocumentProcessingResult {
  /**
   * Whether processing was successful
   */
  success: boolean;
  
  /**
   * Document ID if successfully processed and stored
   */
  documentId?: string;
  
  /**
   * Classification assigned to the document
   */
  classification?: string;
  
  /**
   * Error message if processing failed
   */
  error?: string;
  
  /**
   * Additional metadata about the processing result
   */
  metadata?: Record<string, any>;
}
