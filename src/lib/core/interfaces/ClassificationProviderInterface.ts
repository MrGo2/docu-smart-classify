
/**
 * Interface for document classification providers
 */
export interface ClassificationProviderInterface {
  /**
   * Unique identifier for the classification provider
   */
  id: string;
  
  /**
   * Display name of the classification provider
   */
  name: string;
  
  /**
   * API key or authentication credentials for the provider
   */
  apiKey: string;
  
  /**
   * Classifies a document based on its text content
   * 
   * @param text The text content to classify
   * @param onProgressUpdate Callback for reporting progress (0-100)
   * @param metadata Optional metadata about the document to help with classification
   * @returns The classification label
   */
  classifyDocument(
    text: string,
    onProgressUpdate: (progress: number) => void,
    metadata?: Record<string, any>
  ): Promise<string>;
  
  /**
   * Check if the provider is properly configured (e.g., has valid API key)
   * 
   * @returns Whether the provider is ready to use
   */
  isConfigured(): Promise<boolean>;
}
