
/**
 * Base interface for all AI models in the system
 */
export interface ModelInterface {
  /**
   * Unique identifier for the model
   */
  id: string;
  
  /**
   * Display name of the model
   */
  name: string;
  
  /**
   * Provider/vendor of the model (e.g., "openai", "mistral")
   */
  provider: string;
  
  /**
   * Whether the model is currently available for use
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * Initialize the model with any required resources
   */
  initialize(): Promise<void>;
}
