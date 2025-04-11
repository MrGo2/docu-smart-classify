
import { OcrLanguage, OcrProvider } from "./types";
import { TesseractProvider } from "./providers/TesseractProvider";

/**
 * Factory class to create OCR providers
 */
export class OcrFactory {
  /**
   * Get an OCR provider by name
   * @param providerName The name of the provider to use
   * @returns An OCR provider implementation
   */
  static getProvider(providerName: string): OcrProvider {
    switch (providerName.toLowerCase()) {
      case 'tesseract':
        return new TesseractProvider();
      // Add more providers here as they're implemented
      default:
        return new TesseractProvider(); // Default to Tesseract
    }
  }

  /**
   * Get all available OCR providers
   * @returns Array of available provider names
   */
  static getAvailableProviders(): string[] {
    return ['tesseract']; // Add more as they're implemented
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
}
