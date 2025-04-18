
import { OcrLanguage, OcrProvider } from "./types";
import { TesseractProvider } from "./providers/TesseractProvider";
import { PaddleOcrProvider } from "./providers/PaddleOcrProvider";

/**
 * Factory class to create OCR providers
 */
export class OcrFactory {
  private static providers: Map<string, OcrProvider> = new Map();
  
  /**
   * Get an OCR provider by name
   * @param providerName The name of the provider to use
   * @returns An OCR provider implementation
   */
  static getProvider(providerName: string): OcrProvider {
    // Check if we already have an instance
    const existingProvider = this.providers.get(providerName.toLowerCase());
    if (existingProvider) {
      return existingProvider;
    }
    
    // Create a new provider instance
    let provider: OcrProvider;
    
    switch (providerName.toLowerCase()) {
      case 'paddleocr':
        provider = new PaddleOcrProvider();
        break;
      case 'tesseract':
        provider = new TesseractProvider();
        break;
      default:
        // Default to PaddleOCR
        provider = new PaddleOcrProvider();
    }
    
    // Store the provider for reuse
    this.providers.set(providerName.toLowerCase(), provider);
    return provider;
  }

  /**
   * Get all available OCR providers
   * @returns Array of available provider names
   */
  static getAvailableProviders(): string[] {
    return ['paddleocr', 'tesseract']; 
  }

  /**
   * Check if a language is supported by a provider
   * @param providerName Provider to check
   * @param language Language to check
   * @returns boolean indicating if the language is supported
   */
  static isLanguageSupported(providerName: string, language: OcrLanguage): boolean {
    const provider = this.getProvider(providerName);
    return provider.supportedLanguages.includes(language);
  }
  
  /**
   * Clean up all provider instances
   */
  static async disposeAll(): Promise<void> {
    for (const [_, provider] of this.providers.entries()) {
      if ('dispose' in provider && typeof provider.dispose === 'function') {
        await provider.dispose();
      }
    }
    this.providers.clear();
  }
}
