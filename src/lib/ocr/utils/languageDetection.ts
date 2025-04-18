
type DetectionResult = {
  language: 'spa' | 'eng';
  confidence: number;
};

/**
 * Detects the language from extracted text
 * Uses word pattern matching to identify Spanish vs English
 */
export const detectLanguageFromText = (text: string): DetectionResult => {
  if (!text || text.trim().length === 0) {
    console.log('Language detection: Empty text provided, defaulting to English');
    return { language: 'eng', confidence: 0 };
  }
  
  // Common Spanish words and patterns
  const spanishIndicators = [
    'el', 'la', 'los', 'las', 'y', 'de', 'en', 'con', 'por', 'para',
    'que', 'no', 'un', 'una', 'es', 'son', 'está', 'este', 'como',
    'pero', 'más', 'este', 'está', 'su', 'sus', 'al', 'del', 'lo',
    'cuando', 'ñ', 'á', 'é', 'í', 'ó', 'ú', 'ü', '¿', '¡'
  ];
  
  // Common English words and patterns
  const englishIndicators = [
    'the', 'a', 'of', 'in', 'to', 'and', 'for', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
    'this', 'that', 'these', 'those', 'they', 'we', 'you', 'he', 'she',
    'it', 'not', 'but', 'or', 'if', 'when', 'what', 'which', 'who', 'how'
  ];
  
  // Convert to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // Check for Spanish special characters
  const hasSpanishChars = /[áéíóúüñ¿¡]/i.test(lowerText);
  
  // Count word matches
  let spanishCount = 0;
  let englishCount = 0;
  
  // Simple tokenization - split on whitespace and punctuation
  const words = lowerText.split(/[\s.,;:!?¿¡()\[\]{}'"]+/);
  
  for (const word of words) {
    if (word.length === 0) continue;
    
    if (spanishIndicators.includes(word)) spanishCount++;
    if (englishIndicators.includes(word)) englishCount++;
  }
  
  // Add weight for Spanish special characters
  if (hasSpanishChars) spanishCount += 2;
  
  // Calculate confidence based on word matches
  const totalMatches = spanishCount + englishCount;
  let confidence = totalMatches > 0 ? Math.max(spanishCount, englishCount) / totalMatches : 0.5;
  
  // Adjust minimum confidence
  confidence = Math.max(confidence, 0.51);
  
  console.log(`Language detection: Spanish words: ${spanishCount}, English words: ${englishCount}, Confidence: ${confidence}`);
  
  return {
    language: spanishCount > englishCount ? 'spa' : 'eng',
    confidence
  };
};
