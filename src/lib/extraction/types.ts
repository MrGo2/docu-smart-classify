
/**
 * Defines different strategies for extracting text from documents for classification
 */
export enum ExtractionStrategy {
  /**
   * Extract all text from the document (up to configured limit)
   */
  ALL = "all",
  
  /**
   * Extract only text from the first page
   */
  FIRST_PAGE = "first_page",
  
  /**
   * Extract text from both first and last pages
   */
  FIRST_LAST = "first_last",
  
  /**
   * Extract text from first, middle, and last pages
   */
  FIRST_MIDDLE_LAST = "first_middle_last"
}

/**
 * Configuration for text extraction
 */
export interface ExtractionConfig {
  /**
   * Maximum number of characters to extract for AI classification
   */
  maxClassificationLength: number;
  
  /**
   * Strategy to use for extraction
   */
  strategy: ExtractionStrategy;
}

/**
 * Result of text extraction process
 */
export interface ExtractionResult {
  /**
   * Complete extracted text
   */
  fullText: string;
  
  /**
   * Text snippet used for classification (based on strategy)
   */
  classificationText: string;
}
