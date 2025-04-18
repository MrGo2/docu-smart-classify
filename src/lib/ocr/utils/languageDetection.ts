
type DetectionResult = {
  language: 'spa' | 'eng';
  confidence: number;
};

export const detectLanguageFromText = (text: string): DetectionResult => {
  const spanishIndicators = ['el', 'la', 'los', 'las', 'y', 'de', 'en', 'con', 'por', 'para'];
  const englishIndicators = ['the', 'a', 'of', 'in', 'to', 'and', 'for', 'with', 'by'];
  
  let spanishCount = 0;
  let englishCount = 0;
  
  const words = text.toLowerCase().split(/\s+/);
  for (const word of words) {
    if (spanishIndicators.includes(word)) spanishCount++;
    if (englishIndicators.includes(word)) englishCount++;
  }
  
  // Calculate confidence based on word matches
  const totalMatches = spanishCount + englishCount;
  const confidence = totalMatches > 0 ? Math.max(spanishCount, englishCount) / totalMatches : 0;
  
  return {
    language: spanishCount > englishCount ? 'spa' : 'eng',
    confidence
  };
};
