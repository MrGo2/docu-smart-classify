
import { ModelInterface } from "@/lib/core/interfaces/ModelInterface";
import { ModelError } from "@/lib/errors/ModelError";
import { ModelRegistryService } from "@/lib/services/ModelRegistryService";

/**
 * Factory for creating model instances
 */
export class ModelFactory {
  private static instance: ModelFactory;
  private modelRegistry: ModelRegistryService;
  
  private constructor() {
    this.modelRegistry = ModelRegistryService.getInstance();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): ModelFactory {
    if (!ModelFactory.instance) {
      ModelFactory.instance = new ModelFactory();
    }
    return ModelFactory.instance;
  }
  
  /**
   * Create a model instance by ID
   * 
   * @param modelId ID of the model to create
   * @param options Additional options for model creation
   * @returns The created model
   */
  async createModel(
    modelId: string, 
    options?: Record<string, any>
  ): Promise<ModelInterface> {
    const model = this.modelRegistry.getModel(modelId);
    
    if (!model) {
      throw new ModelError(
        `Model with ID "${modelId}" not found`,
        modelId,
        "MODEL_NOT_FOUND"
      );
    }
    
    try {
      await model.initialize();
      return model;
    } catch (error) {
      throw new ModelError(
        `Failed to initialize model "${modelId}": ${error instanceof Error ? error.message : String(error)}`,
        modelId,
        "MODEL_INITIALIZATION_FAILED",
        { originalError: error }
      );
    }
  }
  
  /**
   * Find available models matching criteria
   * 
   * @param criteria Search criteria
   * @returns Array of matching models
   */
  async findAvailableModels(
    criteria: {
      provider?: string;
      isAvailable?: boolean;
      type?: string;
    }
  ): Promise<ModelInterface[]> {
    let models = this.modelRegistry.getAllModels();
    
    // Filter by provider if specified
    if (criteria.provider) {
      models = models.filter(model => model.provider === criteria.provider);
    }
    
    // Filter by type if specified
    if (criteria.type) {
      models = models.filter(model => 
        "type" in model && (model as any).type === criteria.type
      );
    }
    
    // Check availability if requested
    if (criteria.isAvailable) {
      const availabilityChecks = await Promise.all(
        models.map(async model => ({
          model,
          isAvailable: await model.isAvailable()
        }))
      );
      
      models = availabilityChecks
        .filter(check => check.isAvailable)
        .map(check => check.model);
    }
    
    return models;
  }
}
