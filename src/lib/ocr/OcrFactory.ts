
import { OcrLanguage, OcrProvider } from "./types";
import { TesseractProvider } from "./providers/TesseractProvider";
import { PaddleOcrProvider } from "./providers/PaddleOcrProvider";

/**
 * Factory class to create OCR providers
 */
export class OcrFactory {
  private static providers: Map<string, OcrProvider> = new Map();
  private static providerFailures: Map<string, { count: number, lastFailure: number }> = new Map();
  private static readonly MAX_FAILURES = 3;
  private static readonly FAILURE_RESET_TIME = 600000; // 10 minutes
  
  /**
   * Get an OCR provider by name
   * @param providerName The name of the provider to use
   * @returns An OCR provider implementation
   */
  static getProvider(providerName: string): OcrProvider {
    const normalizedName = providerName.toLowerCase();
    
    // Check if the requested provider has too many recent failures
    const failures = this.providerFailures.get(normalizedName);
    const now = Date.now();
    
    if (failures && failures.count >= this.MAX_FAILURES && 
        (now - failures.lastFailure) < this.FAILURE_RESET_TIME) {
      console.warn(`Provider ${providerName} has failed ${failures.count} times recently. Using fallback.`);
      // Use Tesseract as fallback
      return this.getFallbackProvider();
    }
    
    // Check if we already have an instance
    const existingProvider = this.providers.get(normalizedName);
    if (existingProvider) {
      return existingProvider;
    }
    
    // Create a new provider instance
    let provider: OcrProvider;
    
    try {
      switch (normalizedName) {
        case 'paddleocr':
          provider = new PaddleOcrProvider();
          break;
        case 'tesseract':
          provider = new TesseractProvider();
          break;
        default:
          // Default to PaddleOCR
          console.log(`Unknown provider "${providerName}", defaulting to PaddleOCR`);
          provider = new PaddleOcrProvider();
      }
      
      // Wrap the provider with error tracking
      const wrappedProvider = this.wrapProviderWithErrorTracking(normalizedName, provider);
      
      // Store the provider for reuse
      this.providers.set(normalizedName, wrappedProvider);
      return wrappedProvider;
    } catch (error) {
      console.error(`Error creating OCR provider "${providerName}":`, error);
      return this.getFallbackProvider();
    }
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
    this.providerFailures.clear();
  }
  
  /**
   * Records a provider failure and returns the current failure count
   */
  private static recordProviderFailure(providerName: string): number {
    const normalizedName = providerName.toLowerCase();
    const failures = this.providerFailures.get(normalizedName) || { count: 0, lastFailure: 0 };
    
    failures.count += 1;
    failures.lastFailure = Date.now();
    
    this.providerFailures.set(normalizedName, failures);
    return failures.count;
  }
  
  /**
   * Reset failure count for a provider
   */
  private static resetProviderFailures(providerName: string): void {
    this.providerFailures.delete(providerName.toLowerCase());
  }
  
  /**
   * Get a fallback provider when the requested one fails
   */
  private static getFallbackProvider(): OcrProvider {
    try {
      const fallback = new TesseractProvider();
      return this.wrapProviderWithErrorTracking('tesseract_fallback', fallback);
    } catch (error) {
      console.error("Even fallback provider creation failed:", error);
      // Return a minimal provider that just returns an error
      return {
        name: "error_provider",
        supportedLanguages: ["eng", "spa", "auto"],
        extractText: async () => {
          throw new Error("All OCR providers failed to initialize");
        },
        supportsFileType: () => true,
        getSupportedFileTypes: () => ['image/jpeg', 'image/png', 'application/pdf'],
        dispose: async () => {}
      };
    }
  }
  
  /**
   * Wraps a provider with error tracking
   */
  private static wrapProviderWithErrorTracking(name: string, provider: OcrProvider): OcrProvider {
    const originalExtractText = provider.extractText.bind(provider);
    
    provider.extractText = async (file, onProgressUpdate, language, options) => {
      try {
        const result = await originalExtractText(file, onProgressUpdate, language, options);
        // Success, reset failures
        this.resetProviderFailures(name);
        return result;
      } catch (error) {
        const failureCount = this.recordProviderFailure(name);
        console.error(`OCR provider "${name}" failed (${failureCount} recent failures):`, error);
        throw error;
      }
    };
    
    return provider;
  }
}
