
import { ModelInterface } from "@/lib/core/interfaces/ModelInterface";

/**
 * Service for managing and accessing all available AI models
 */
export class ModelRegistryService {
  private static instance: ModelRegistryService;
  private models: Map<string, ModelInterface> = new Map();

  private constructor() {}

  /**
   * Get the singleton instance of ModelRegistryService
   */
  public static getInstance(): ModelRegistryService {
    if (!ModelRegistryService.instance) {
      ModelRegistryService.instance = new ModelRegistryService();
    }
    return ModelRegistryService.instance;
  }

  /**
   * Register a new model with the registry
   * 
   * @param model The model to register
   * @returns True if registration was successful
   */
  public registerModel(model: ModelInterface): boolean {
    if (this.models.has(model.id)) {
      return false;
    }
    
    this.models.set(model.id, model);
    return true;
  }

  /**
   * Get a model by its ID
   * 
   * @param modelId The ID of the model to retrieve
   * @returns The requested model or undefined if not found
   */
  public getModel(modelId: string): ModelInterface | undefined {
    return this.models.get(modelId);
  }

  /**
   * Get all registered models
   * 
   * @returns Array of all registered models
   */
  public getAllModels(): ModelInterface[] {
    return Array.from(this.models.values());
  }

  /**
   * Get models from a specific provider
   * 
   * @param provider The provider name to filter by
   * @returns Array of models from the specified provider
   */
  public getModelsByProvider(provider: string): ModelInterface[] {
    return this.getAllModels().filter(model => model.provider === provider);
  }

  /**
   * Check if a model with the given ID exists
   * 
   * @param modelId The ID to check
   * @returns Whether the model exists
   */
  public hasModel(modelId: string): boolean {
    return this.models.has(modelId);
  }

  /**
   * Remove a model from the registry
   * 
   * @param modelId The ID of the model to remove
   * @returns Whether the model was successfully removed
   */
  public unregisterModel(modelId: string): boolean {
    return this.models.delete(modelId);
  }
}
