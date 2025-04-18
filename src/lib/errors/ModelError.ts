
/**
 * Base error class for model failures
 */
export class ModelError extends Error {
  /**
   * Model ID that experienced the error
   */
  modelId: string;
  
  /**
   * Error code for programmatic handling
   */
  errorCode: string;
  
  /**
   * Additional error details
   */
  details?: Record<string, any>;

  /**
   * Create a new ModelError
   * 
   * @param message Error message
   * @param modelId ID of the model
   * @param errorCode Error code
   * @param details Additional error details
   */
  constructor(
    message: string,
    modelId: string,
    errorCode: string = "MODEL_ERROR",
    details?: Record<string, any>
  ) {
    super(message);
    this.name = "ModelError";
    this.modelId = modelId;
    this.errorCode = errorCode;
    this.details = details;
  }

  /**
   * Create an authentication error
   * 
   * @param modelId ID of the model
   * @param details Additional details
   * @returns A model error
   */
  static authenticationError(modelId: string, details?: Record<string, any>): ModelError {
    return new ModelError(
      `Authentication failed for model ${modelId}`,
      modelId,
      "MODEL_AUTH_ERROR",
      details
    );
  }

  /**
   * Create a rate limit error
   * 
   * @param modelId ID of the model
   * @param details Additional details
   * @returns A model error
   */
  static rateLimitError(modelId: string, details?: Record<string, any>): ModelError {
    return new ModelError(
      `Rate limit exceeded for model ${modelId}`,
      modelId,
      "MODEL_RATE_LIMIT",
      details
    );
  }

  /**
   * Create a timeout error
   * 
   * @param modelId ID of the model
   * @param details Additional details
   * @returns A model error
   */
  static timeoutError(modelId: string, details?: Record<string, any>): ModelError {
    return new ModelError(
      `Request timed out for model ${modelId}`,
      modelId,
      "MODEL_TIMEOUT",
      details
    );
  }
}
