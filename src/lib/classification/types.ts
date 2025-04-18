
/**
 * Result of document classification
 */
export interface ClassificationResult {
  /**
   * The assigned classification/category
   */
  classification: string;
  
  /**
   * Confidence score (0-1) of the classification
   */
  confidence?: number;
  
  /**
   * Alternative classifications with their confidence scores
   */
  alternatives?: Array<{
    classification: string;
    confidence: number;
  }>;
  
  /**
   * Duration of classification in milliseconds
   */
  durationMs?: number;
  
  /**
   * Model used for classification
   */
  model?: string;
  
  /**
   * Raw response from the classification service
   */
  rawResponse?: any;
}

/**
 * Supported document classifications
 */
export enum DocumentClassification {
  INVOICE = "Invoice",
  RESUME = "Resume",
  CONTRACT = "Contract",
  REPORT = "Report",
  FORM = "Form",
  RECEIPT = "Receipt",
  LETTER = "Letter",
  OTHER = "Other"
}

/**
 * Helper for working with classification results
 */
export class ClassificationHelper {
  /**
   * Check if a classification is valid
   * 
   * @param classification Classification to check
   * @returns Whether the classification is valid
   */
  static isValidClassification(classification: string): boolean {
    return Object.values(DocumentClassification).includes(classification as DocumentClassification);
  }
  
  /**
   * Get a default/fallback classification
   * 
   * @returns Default classification
   */
  static getDefaultClassification(): string {
    return DocumentClassification.REPORT;
  }
  
  /**
   * Create a classification result
   * 
   * @param classification Primary classification
   * @param confidence Confidence level (0-1)
   * @param options Additional options
   * @returns Classification result
   */
  static createResult(
    classification: string,
    confidence: number = 1.0,
    options?: {
      alternatives?: Array<{ classification: string; confidence: number }>;
      durationMs?: number;
      model?: string;
      rawResponse?: any;
    }
  ): ClassificationResult {
    // Validate classification
    const validClassification = this.isValidClassification(classification) 
      ? classification 
      : this.getDefaultClassification();
      
    return {
      classification: validClassification,
      confidence,
      alternatives: options?.alternatives || [],
      durationMs: options?.durationMs,
      model: options?.model,
      rawResponse: options?.rawResponse
    };
  }
}
