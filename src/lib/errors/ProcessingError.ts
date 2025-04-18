
/**
 * Error class for document processing failures
 */
export class ProcessingError extends Error {
  /**
   * Stage of processing where the error occurred
   */
  stage: "OCR" | "EXTRACTION" | "CLASSIFICATION" | "STORAGE" | "UNKNOWN";
  
  /**
   * Error code for programmatic handling
   */
  errorCode: string;
  
  /**
   * Additional error details
   */
  details?: Record<string, any>;

  /**
   * Create a new ProcessingError
   * 
   * @param message Error message
   * @param stage Processing stage where error occurred
   * @param errorCode Error code
   * @param details Additional error details
   */
  constructor(
    message: string,
    stage: "OCR" | "EXTRACTION" | "CLASSIFICATION" | "STORAGE" | "UNKNOWN" = "UNKNOWN",
    errorCode: string = "PROCESSING_ERROR",
    details?: Record<string, any>
  ) {
    super(message);
    this.name = "ProcessingError";
    this.stage = stage;
    this.errorCode = errorCode;
    this.details = details;
  }

  /**
   * Create an OCR error
   * 
   * @param message Error message
   * @param details Additional details
   * @returns A processing error
   */
  static ocrError(message: string, details?: Record<string, any>): ProcessingError {
    return new ProcessingError(
      message,
      "OCR",
      "OCR_ERROR",
      details
    );
  }

  /**
   * Create a classification error
   * 
   * @param message Error message
   * @param details Additional details
   * @returns A processing error
   */
  static classificationError(message: string, details?: Record<string, any>): ProcessingError {
    return new ProcessingError(
      message,
      "CLASSIFICATION",
      "CLASSIFICATION_ERROR",
      details
    );
  }

  /**
   * Create a storage error
   * 
   * @param message Error message
   * @param details Additional details
   * @returns A processing error
   */
  static storageError(message: string, details?: Record<string, any>): ProcessingError {
    return new ProcessingError(
      message,
      "STORAGE",
      "STORAGE_ERROR",
      details
    );
  }

  /**
   * Create an unsupported file type error
   * 
   * @param fileType The unsupported file type
   * @returns A processing error
   */
  static unsupportedFileTypeError(fileType: string): ProcessingError {
    return new ProcessingError(
      `Unsupported file type: ${fileType}`,
      "UNKNOWN",
      "UNSUPPORTED_FILE_TYPE",
      { fileType }
    );
  }
}
