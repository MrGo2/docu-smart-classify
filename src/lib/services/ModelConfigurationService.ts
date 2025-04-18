
/**
 * Configuration for AI models
 */
export interface ModelConfiguration {
  /**
   * Model ID this configuration belongs to
   */
  modelId: string;
  
  /**
   * API key or other authentication credentials
   */
  apiKey?: string;
  
  /**
   * Additional model-specific parameters
   */
  parameters: Record<string, any>;
  
  /**
   * Whether this is the default configuration for this model type
   */
  isDefault: boolean;
}

/**
 * Service for managing model configurations
 */
export class ModelConfigurationService {
  private static instance: ModelConfigurationService;
  private configurations: Map<string, ModelConfiguration> = new Map();

  private constructor() {}

  /**
   * Get the singleton instance of ModelConfigurationService
   */
  public static getInstance(): ModelConfigurationService {
    if (!ModelConfigurationService.instance) {
      ModelConfigurationService.instance = new ModelConfigurationService();
    }
    return ModelConfigurationService.instance;
  }

  /**
   * Save a model configuration
   * 
   * @param config The configuration to save
   */
  public saveConfiguration(config: ModelConfiguration): void {
    this.configurations.set(config.modelId, config);
  }

  /**
   * Get a model's configuration
   * 
   * @param modelId The model ID to get configuration for
   * @returns The model configuration or undefined if not found
   */
  public getConfiguration(modelId: string): ModelConfiguration | undefined {
    return this.configurations.get(modelId);
  }

  /**
   * Get the default configuration for a model type
   * 
   * @param modelType The type of model (e.g., "ocr", "classification")
   * @returns The default configuration if found
   */
  public getDefaultConfiguration(modelType: string): ModelConfiguration | undefined {
    for (const config of this.configurations.values()) {
      if (config.isDefault && config.parameters.type === modelType) {
        return config;
      }
    }
    return undefined;
  }

  /**
   * Load configurations from storage or API
   */
  public async loadConfigurations(): Promise<void> {
    // Implementation would load from database or other storage
    // This is a placeholder for the actual implementation
  }
}
