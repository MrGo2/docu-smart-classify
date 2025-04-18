
import { DocumentProcessingOptions, DocumentProcessingResult, DocumentProcessorInterface } from "@/lib/core/interfaces/DocumentProcessorInterface";
import { OcrLanguage } from "@/lib/ocr/types";
import { ExtractionStrategy } from "@/lib/extraction/types";

/**
 * Service for coordinating document processing workflows
 */
export class DocumentProcessingService {
  private processor: DocumentProcessorInterface;

  /**
   * Create a new DocumentProcessingService
   * 
   * @param processor The document processor implementation to use
   */
  constructor(processor: DocumentProcessorInterface) {
    this.processor = processor;
  }

  /**
   * Process a document through the complete workflow
   * 
   * @param file The document to process
   * @param options Processing options
   * @param onProgressUpdate Callback for reporting progress
   * @param onStatusUpdate Callback for status message updates
   * @returns Result of the processing operation
   */
  public async processDocument(
    file: File,
    options: {
      projectId?: string;
      ocrLanguage?: OcrLanguage;
      extractionStrategy?: ExtractionStrategy;
      classificationModel?: string;
    },
    onProgressUpdate: (progress: number) => void,
    onStatusUpdate: (status: string) => void
  ): Promise<DocumentProcessingResult> {
    const processingOptions: DocumentProcessingOptions = {
      projectId: options.projectId,
      ocrLanguage: options.ocrLanguage || "spa",
      extractionStrategy: options.extractionStrategy || ExtractionStrategy.FIRST_PAGE,
      classificationModel: options.classificationModel || "openai"
    };

    try {
      // Validate file is supported
      if (!this.processor.supportsFileType(file.type)) {
        return {
          success: false,
          error: `File type "${file.type}" is not supported`
        };
      }

      // Process the document
      return await this.processor.processDocument(
        file,
        processingOptions,
        onProgressUpdate,
        onStatusUpdate
      );
    } catch (error) {
      console.error("Document processing error:", error);
      return {
        success: false,
        error: `Processing failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Get a list of all supported file types for processing
   * 
   * @returns Array of supported MIME types
   */
  public getSupportedFileTypes(): string[] {
    return this.processor.getSupportedFileTypes();
  }

  /**
   * Check if a file type is supported for processing
   * 
   * @param fileType MIME type to check
   * @returns Whether the file type is supported
   */
  public supportsFileType(fileType: string): boolean {
    return this.processor.supportsFileType(fileType);
  }
}
