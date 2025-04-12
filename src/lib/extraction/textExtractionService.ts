
import { ExtractionStrategy, ExtractionConfig, ExtractionResult } from "./types";

/**
 * Service for extracting text from documents using different strategies
 */
export class TextExtractionService {
  /**
   * Processes text according to the specified extraction strategy
   */
  public static extractTextForClassification(
    fullText: string,
    pageBreaks: string[],
    config: ExtractionConfig
  ): ExtractionResult {
    // Split the text into pages based on page break markers
    const pages = this.splitTextIntoPages(fullText, pageBreaks);
    
    // Apply the selected extraction strategy
    let classificationText = "";
    
    switch (config.strategy) {
      case ExtractionStrategy.FIRST_PAGE:
        classificationText = this.extractFirstPageText(pages);
        break;
        
      case ExtractionStrategy.FIRST_LAST:
        classificationText = this.extractFirstLastText(pages);
        break;
        
      case ExtractionStrategy.FIRST_MIDDLE_LAST:
        classificationText = this.extractFirstMiddleLastText(pages);
        break;
        
      case ExtractionStrategy.ALL:
      default:
        classificationText = fullText;
        break;
    }
    
    // Truncate the classification text to the maximum allowed length
    const truncatedText = this.truncateText(classificationText, config.maxClassificationLength);
    
    return {
      fullText,
      classificationText: truncatedText
    };
  }
  
  /**
   * Splits text into pages based on page break markers
   */
  private static splitTextIntoPages(text: string, pageBreakMarkers: string[]): string[] {
    if (!text) return [];
    
    // Use a default page break marker if none specified
    const defaultMarker = "=== PAGE BREAK ===";
    const markers = pageBreakMarkers.length > 0 ? pageBreakMarkers : [defaultMarker];
    
    let pages = [text];
    
    // Try each marker to split the text
    for (const marker of markers) {
      if (text.includes(marker)) {
        pages = text.split(marker).map(page => page.trim());
        break;
      }
    }
    
    return pages.filter(page => page.length > 0);
  }
  
  /**
   * Extracts text only from the first page
   */
  private static extractFirstPageText(pages: string[]): string {
    if (pages.length === 0) return "";
    return pages[0];
  }
  
  /**
   * Extracts text from the first and last pages
   */
  private static extractFirstLastText(pages: string[]): string {
    if (pages.length === 0) return "";
    if (pages.length === 1) return pages[0];
    
    return `${pages[0]}\n\n[...]\n\n${pages[pages.length - 1]}`;
  }
  
  /**
   * Extracts text from the first, middle, and last pages
   */
  private static extractFirstMiddleLastText(pages: string[]): string {
    if (pages.length <= 2) {
      // If 2 or fewer pages, return all text
      return pages.join("\n\n");
    }
    
    // Get the middle page index
    const middleIndex = Math.floor(pages.length / 2);
    
    return `${pages[0]}\n\n[...]\n\n${pages[middleIndex]}\n\n[...]\n\n${pages[pages.length - 1]}`;
  }
  
  /**
   * Intelligently truncates text to the specified maximum length
   */
  private static truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    
    // Simple truncation with indicator
    return text.substring(0, maxLength) + " [...]";
  }
}
