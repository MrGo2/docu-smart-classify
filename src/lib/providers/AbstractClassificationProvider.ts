
import { ClassificationProviderInterface } from "@/lib/core/interfaces/ClassificationProviderInterface";
import { ClassificationResult } from "@/lib/classification/types";

/**
 * Abstract base class for all document classification providers
 */
export abstract class AbstractClassificationProvider implements ClassificationProviderInterface {
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
   * Create a new AbstractClassificationProvider
   * 
   * @param id Provider ID
   * @param name Display name
   * @param apiKey API key for the service
   */
  constructor(id: string, name: string, apiKey: string) {
    this.id = id;
    this.name = name;
    this.apiKey = apiKey;
  }

  /**
   * Classifies a document based on its text content
   * 
   * @param text The text content to classify
   * @param onProgressUpdate Callback for reporting progress (0-100)
   * @param metadata Optional metadata about the document to help with classification
   * @returns The classification label
   */
  abstract classifyDocument(
    text: string,
    onProgressUpdate: (progress: number) => void,
    metadata?: Record<string, any>
  ): Promise<string>;
  
  /**
   * Check if the provider is properly configured (e.g., has valid API key)
   * 
   * @returns Whether the provider is ready to use
   */
  abstract isConfigured(): Promise<boolean>;
}
