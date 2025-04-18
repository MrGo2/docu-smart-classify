
/**
 * Database representation of model settings
 */
export interface ModelConfigurationEntity {
  /**
   * Unique identifier for this configuration
   */
  id: string;
  
  /**
   * Model ID this configuration is for
   */
  modelId: string;
  
  /**
   * API key (encrypted or reference)
   */
  apiKey?: string;
  
  /**
   * Whether this is the default configuration for this model type
   */
  isDefault: boolean;
  
  /**
   * When the configuration was created
   */
  createdAt: string;
  
  /**
   * When the configuration was last updated
   */
  updatedAt: string;
  
  /**
   * Model-specific configuration parameters
   */
  parameters: Record<string, any>;
}

/**
 * Helper class for working with model configurations
 */
export class ModelConfigurationEntityHelper {
  /**
   * Convert a database entity to a model configuration
   * 
   * @param entity The database entity
   * @returns A model configuration object
   */
  static fromEntity(entity: ModelConfigurationEntity) {
    return {
      modelId: entity.modelId,
      apiKey: entity.apiKey,
      parameters: entity.parameters,
      isDefault: entity.isDefault
    };
  }
  
  /**
   * Create a database entity from a configuration object
   * 
   * @param config The configuration object
   * @param id Optional ID (will be generated if not provided)
   * @returns A database entity
   */
  static toEntity(
    config: {
      modelId: string;
      apiKey?: string;
      parameters: Record<string, any>;
      isDefault: boolean;
    },
    id?: string
  ): ModelConfigurationEntity {
    const now = new Date().toISOString();
    return {
      id: id || crypto.randomUUID(),
      modelId: config.modelId,
      apiKey: config.apiKey,
      isDefault: config.isDefault,
      createdAt: now,
      updatedAt: now,
      parameters: config.parameters
    };
  }
}
