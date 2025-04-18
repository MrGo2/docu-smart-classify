
import { OcrLanguage } from "@/lib/ocr/types";
import { ExtractionStrategy } from "@/lib/extraction/types";

/**
 * Configuration for a document processing pipeline
 */
export interface ProcessingPipelineConfiguration {
  /**
   * Unique identifier for this pipeline configuration
   */
  id: string;
  
  /**
   * Display name for the pipeline
   */
  name: string;
  
  /**
   * Optional project ID this pipeline is associated with
   */
  projectId?: string;
  
  /**
   * OCR provider to use for text extraction
   */
  ocrProviderId?: string;
  
  /**
   * Language settings for OCR
   */
  ocrLanguage: OcrLanguage;
  
  /**
   * Strategy for text extraction
   */
  extractionStrategy: ExtractionStrategy;
  
  /**
   * Classification model to use
   */
  classificationModelId: string;
  
  /**
   * Whether to attempt OCR on documents
   */
  performOcr: boolean;
  
  /**
   * Whether to perform classification
   */
  performClassification: boolean;
  
  /**
   * Storage provider to use
   */
  storageProviderId: string;
  
  /**
   * Additional pipeline-specific settings
   */
  additionalSettings?: Record<string, any>;
}

/**
 * Default pipeline configuration factory
 */
export class DefaultPipelineConfigurationFactory {
  /**
   * Create a default pipeline configuration
   * 
   * @param projectId Optional project ID to associate with
   * @returns A default pipeline configuration
   */
  static createDefault(projectId?: string): ProcessingPipelineConfiguration {
    return {
      id: crypto.randomUUID(),
      name: "Default Pipeline",
      projectId,
      ocrProviderId: "tesseract",
      ocrLanguage: "spa",
      extractionStrategy: ExtractionStrategy.FIRST_PAGE,
      classificationModelId: "openai",
      performOcr: true,
      performClassification: true,
      storageProviderId: "supabase"
    };
  }
}
