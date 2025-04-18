
import { OcrLanguage } from "@/lib/ocr/types";

/**
 * Language configuration settings for document processing
 */
export interface LanguageConfiguration {
  /**
   * Primary language for OCR
   */
  ocrLanguage: OcrLanguage;
  
  /**
   * Additional OCR languages to try if primary fails
   */
  fallbackLanguages?: OcrLanguage[];
  
  /**
   * Language for classification prompts
   */
  classificationLanguage: string;
  
  /**
   * Language for extraction prompts
   */
  extractionLanguage: string;
  
  /**
   * Display name settings
   */
  displayNames: {
    [key in OcrLanguage]?: string;
  };
}

/**
 * Manager for language configurations
 */
export class LanguageConfigurationManager {
  private static instance: LanguageConfigurationManager;
  private configurations: Map<string, LanguageConfiguration> = new Map();
  
  private constructor() {
    // Initialize with default configurations
    this.configurations.set("default", {
      ocrLanguage: "spa",
      classificationLanguage: "spanish",
      extractionLanguage: "spanish",
      displayNames: {
        "spa": "Spanish",
        "eng": "English"
      }
    });
    
    this.configurations.set("english", {
      ocrLanguage: "eng",
      classificationLanguage: "english",
      extractionLanguage: "english",
      displayNames: {
        "spa": "Spanish",
        "eng": "English"
      }
    });
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): LanguageConfigurationManager {
    if (!LanguageConfigurationManager.instance) {
      LanguageConfigurationManager.instance = new LanguageConfigurationManager();
    }
    return LanguageConfigurationManager.instance;
  }
  
  /**
   * Get a language configuration
   * 
   * @param name Configuration name (or "default")
   */
  getConfiguration(name: string = "default"): LanguageConfiguration {
    return this.configurations.get(name) || this.configurations.get("default")!;
  }
  
  /**
   * Set a language configuration
   * 
   * @param name Configuration name
   * @param config Language configuration
   */
  setConfiguration(name: string, config: LanguageConfiguration): void {
    this.configurations.set(name, config);
  }
}
