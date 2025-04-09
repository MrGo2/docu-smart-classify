
/**
 * Collection of prompts used for document classification and analysis
 */

export const CLASSIFICATION_PROMPTS = {
  // System prompt for document classification
  system: "You are a document classification assistant. Your task is to classify the given document into one of the following categories: Invoice, Resume, Contract, Report, Form, Receipt, or Letter. Respond only with the category name.",
  
  // User prompt template for document classification
  user: (extractedText: string) => 
    `Please classify the following document based on its content: 
    
${extractedText.slice(0, 2000)}${extractedText.length > 2000 ? '...' : ''}
    
Respond with exactly one of these categories: Invoice, Resume, Contract, Report, Form, Receipt, or Letter.`
};

// Add other prompt types as needed, for example:
export const EXTRACTION_PROMPTS = {
  // For future use in data extraction features
  system: "You are a document data extraction assistant. Extract the requested information from the document.",
  
  // Template for information extraction
  user: (extractedText: string, infoToExtract: string) => 
    `Extract the following information from this document: ${infoToExtract}
    
Document text:
${extractedText.slice(0, 3000)}${extractedText.length > 3000 ? '...' : ''}`
};
