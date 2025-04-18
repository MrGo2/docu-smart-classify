import { OcrLanguage } from "../types";

type DetectionResult = {
  language: OcrLanguage;
  confidence: number;
};

interface LanguageIndicators {
  words: string[];
  patterns: RegExp[];
  weight: number;
}

// Primary languages with more extensive patterns
const PRIMARY_LANGUAGES: Record<'spa' | 'eng', LanguageIndicators> = {
  spa: {
    words: [
      // High-frequency Spanish words
      'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
      'y', 'e', 'o', 'u', 'de', 'del', 'en', 'con', 'por', 'para',
      'que', 'no', 'sí', 'es', 'son', 'está', 'están', 'este',
      'pero', 'más', 'muy', 'sin', 'sobre', 'entre', 'cada',
      'todo', 'toda', 'todos', 'todas', 'otro', 'otra', 'mi',
      'su', 'sus', 'al', 'lo', 'le', 'se', 'me', 'te', 'nos'
    ],
    patterns: [
      // Spanish-specific characters and patterns
      /[áéíóúüñ¿¡]/g,
      /\b(?:ción|ciones|dad|dades|idad|idades)\b/g,
      /\b(?:mente|miento|mientos|ando|endo|ado|ido)\b/g,
      /\b(?:ar|er|ir|aba|ía|aría|ería|ando|endo)\b/g,
      /(?:ll|rr|ñ|ch)\w+/g
    ],
    weight: 1.2 // Slightly higher weight for Spanish
  },
  eng: {
    words: [
      // High-frequency English words
      'the', 'a', 'an', 'and', 'or', 'but', 'of', 'in', 'on',
      'at', 'to', 'for', 'with', 'by', 'from', 'up', 'about',
      'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'this', 'that', 'these', 'those', 'they', 'we', 'you',
      'he', 'she', 'it', 'not', 'what', 'when', 'where', 'who'
    ],
    patterns: [
      // English-specific patterns
      /\b(?:ing|ed|ly|tion|ment)\b/g,
      /\b(?:th|wh|sh|ch)\w+/g,
      /\b(?:able|ible|ful|less|ness|ship|hood)\b/g,
      /\b(?:'s|'t|'re|'ve|'ll|'d)\b/g,
      /\b(?:un|re|dis|over|under|out)\w+/g
    ],
    weight: 1
  }
};

// Secondary languages with basic patterns
const SECONDARY_LANGUAGES: Record<Exclude<OcrLanguage, 'spa' | 'eng' | 'auto'>, LanguageIndicators> = {
  fra: {
    words: [
      'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'où',
      'dans', 'sur', 'sous', 'avec', 'pour', 'par', 'de', 'du',
      'ce', 'cette', 'ces', 'je', 'tu', 'il', 'elle', 'nous', 'vous'
    ],
    patterns: [
      /[éèêëàâäôöûüçîïÿ]/g,
      /\b(?:tion|ment|eux|euse)\b/g
    ],
    weight: 0.9
  },
  deu: {
    words: [
      'der', 'die', 'das', 'ein', 'eine', 'und', 'oder', 'für',
      'mit', 'bei', 'seit', 'von', 'aus', 'nach', 'zu', 'zur',
      'zum', 'ist', 'sind', 'war', 'hatte', 'haben', 'werden'
    ],
    patterns: [
      /[äöüß]/g,
      /\b(?:ung|heit|keit|lich|isch)\b/g
    ],
    weight: 0.9
  },
  ita: {
    words: [
      'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una',
      'e', 'ed', 'di', 'da', 'in', 'con', 'su', 'per', 'tra',
      'fra', 'sono', 'è', 'sta', 'questo', 'questa', 'questi'
    ],
    patterns: [
      /[àèéìíîòóùú]/g,
      /\b(?:zione|mento|ità|mente)\b/g
    ],
    weight: 0.9
  },
  por: {
    words: [
      'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'e',
      'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos',
      'por', 'para', 'pelo', 'pela', 'que', 'quem', 'qual'
    ],
    patterns: [
      /[áâãàçéêíóôõú]/g,
      /\b(?:ção|dade|mente|ável)\b/g
    ],
    weight: 0.9
  },
  cat: {
    words: [
      'el', 'la', 'els', 'les', 'un', 'una', 'i', 'o', 'de',
      'en', 'amb', 'per', 'què', 'qui', 'quan', 'on', 'com',
      'més', 'està', 'són', 'aquest', 'aquesta', 'aquests'
    ],
    patterns: [
      /[àèéíòóúïü]/g,
      /\b(?:ció|ment|tat|ble)\b/g
    ],
    weight: 0.85
  },
  eus: {
    words: [
      'bat', 'eta', 'da', 'dira', 'du', 'dute', 'nahi', 'behar',
      'ez', 'bai', 'ere', 'zer', 'nor', 'non', 'nola', 'hau',
      'hori', 'hura', 'hauek', 'horiek', 'haiek', 'dago'
    ],
    patterns: [
      /\b(?:ak|ek|en|ko|ra|tik)\b/g,
      /\b(?:tasun|keria|garri|tzaile)\b/g
    ],
    weight: 1.1
  },
  glg: {
    words: [
      'o', 'a', 'os', 'as', 'un', 'unha', 'e', 'ou', 'de', 'do',
      'da', 'en', 'no', 'na', 'nos', 'nas', 'por', 'para', 'polo',
      'pola', 'que', 'quen', 'cal', 'cando', 'onde', 'como'
    ],
    patterns: [
      /[áéíóúü]/g,
      /\b(?:ción|mento|dade|ble)\b/g
    ],
    weight: 0.85
  }
};

/**
 * Detects the language from extracted text using a two-phase approach:
 * 1. First checks for Spanish and English first
 * 2. If no strong match is found, checks other languages
 */
export const detectLanguageFromText = (text: string): DetectionResult => {
  if (!text || text.trim().length === 0) {
    console.log('Language detection: Empty text provided, defaulting to Spanish');
    return { language: 'spa', confidence: 0 };
  }

  // Normalize text
  const normalizedText = text.toLowerCase().trim();
  const words = normalizedText.split(/[\s.,;:!?¿¡()\[\]{}'"]+/);

  // Phase 1: Check Spanish and English first
  const primaryScores = new Map<OcrLanguage, number>();
  
  for (const [language, indicators] of Object.entries(PRIMARY_LANGUAGES)) {
    const lang = language as OcrLanguage;
    
    // Word matching
    const wordMatches = words.filter(word => 
      word.length > 0 && indicators.words.includes(word)
    ).length;
    
    // Pattern matching
    const patternMatches = indicators.patterns.reduce((sum, pattern) => {
      const matches = (normalizedText.match(pattern) || []).length;
      return sum + matches;
    }, 0);
    
    // Calculate weighted score
    const score = (wordMatches * 2 + patternMatches) * indicators.weight;
    primaryScores.set(lang, score);
  }

  // Check if we have a strong primary language match
  const [bestPrimaryLang, bestPrimaryScore] = Array.from(primaryScores.entries())
    .reduce((best, current) => current[1] > best[1] ? current : best, ['spa', 0]);
  
  const primaryConfidence = bestPrimaryScore / (Array.from(primaryScores.values())
    .reduce((a, b) => a + b, 0) || 1);

  // If we have a strong primary match (>70% confidence), return it
  if (primaryConfidence > 0.7) {
    console.log('Primary language detection:', 
      Object.fromEntries(primaryScores.entries()),
      `\nSelected: ${bestPrimaryLang} with confidence: ${primaryConfidence}`
    );
    return { language: bestPrimaryLang as OcrLanguage, confidence: primaryConfidence };
  }

  // Phase 2: Check all languages if no strong primary match
  const allScores = new Map<OcrLanguage, number>(primaryScores);
  
  // Add scores for secondary languages
  for (const [language, indicators] of Object.entries(SECONDARY_LANGUAGES)) {
    const lang = language as OcrLanguage;
    
    const wordMatches = words.filter(word => 
      word.length > 0 && indicators.words.includes(word)
    ).length;
    
    const patternMatches = indicators.patterns.reduce((sum, pattern) => {
      const matches = (normalizedText.match(pattern) || []).length;
      return sum + matches;
    }, 0);
    
    const score = (wordMatches * 2 + patternMatches) * indicators.weight;
    allScores.set(lang, score);
  }

  // Find best overall match
  const [bestLang, bestScore] = Array.from(allScores.entries())
    .reduce((best, current) => current[1] > best[1] ? current : best, ['spa', 0]);
  
  const totalScore = Array.from(allScores.values()).reduce((a, b) => a + b, 0);
  const confidence = Math.min(1, Math.max(0.51, bestScore / (totalScore || 1)));

  console.log('Full language detection results:', 
    Object.fromEntries(allScores.entries()),
    `\nSelected: ${bestLang} with confidence: ${confidence}`
  );

  return {
    language: bestLang as OcrLanguage,
    confidence
  };
};
