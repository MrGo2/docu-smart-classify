
import { CLASSIFICATION_PROMPTS } from "../utils/prompts";

/**
 * Service for classifying documents using AI
 */
export const classifyDocument = async (
  text: string, 
  apiKey: string, 
  modelService: string,
  onProgressUpdate: (progress: number) => void
): Promise<string> => {
  try {
    onProgressUpdate(80);

    // Different API endpoints and parameters based on the selected AI service
    let apiEndpoint: string;
    let requestBody: any;

    // Configure request based on selected model service
    switch(modelService) {
      case "openai":
        apiEndpoint = "https://api.openai.com/v1/chat/completions";
        requestBody = {
          model: "gpt-3.5-turbo", // Use appropriate model
          messages: [
            { role: "system", content: CLASSIFICATION_PROMPTS.system },
            { role: "user", content: CLASSIFICATION_PROMPTS.user(text) }
          ],
          temperature: 0.3,
          max_tokens: 50
        };
        break;
        
      case "mistral":
        apiEndpoint = "https://api.mistral.ai/v1/chat/completions";
        requestBody = {
          model: "mistral-small", // Use appropriate model
          messages: [
            { role: "system", content: CLASSIFICATION_PROMPTS.system },
            { role: "user", content: CLASSIFICATION_PROMPTS.user(text) }
          ],
          temperature: 0.3,
          max_tokens: 50
        };
        break;
        
      case "claude":
        apiEndpoint = "https://api.anthropic.com/v1/complete";
        requestBody = {
          prompt: `${CLASSIFICATION_PROMPTS.system}\n\nHuman: ${CLASSIFICATION_PROMPTS.user(text)}\n\nAssistant:`,
          model: "claude-instant-1",
          max_tokens_to_sample: 50,
          temperature: 0.3
        };
        break;
        
      default:
        throw new Error(`Unsupported model service: ${modelService}`);
    }

    console.log(`Calling ${modelService} API for classification...`);
    
    // Make the API request
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Extract the classification based on the AI service's response format
    let classification: string;
    
    if (modelService === "openai" || modelService === "mistral") {
      classification = data.choices[0].message.content.trim();
    } else if (modelService === "claude") {
      classification = data.completion.trim();
    } else {
      throw new Error(`Unsupported model service for response parsing: ${modelService}`);
    }

    // Validate classification is one of the supported types
    const validClassifications = ["Invoice", "Resume", "Contract", "Report", "Form", "Receipt", "Letter"];
    
    if (!validClassifications.includes(classification)) {
      console.warn(`Invalid classification received: ${classification}. Defaulting to "Report".`);
      classification = "Report";
    }
    
    onProgressUpdate(90);
    return classification;
    
  } catch (error) {
    console.error("Classification error:", error);
    throw new Error(`Failed to classify the document: ${error instanceof Error ? error.message : String(error)}`);
  }
};
