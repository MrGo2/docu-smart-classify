
import { CLASSIFICATION_PROMPTS } from "../utils/prompts";
import { toast } from "@/hooks/use-toast";

/**
 * Service for classifying documents using AI
 */
export const classifyDocument = async (
  text: string, 
  apiKey: string, 
  modelService: string,
  onProgressUpdate: (progress: number) => void,
  file?: File
): Promise<string> => {
  try {
    onProgressUpdate(80);

    // Extract metadata to enrich context for classification
    let metadataContext = "";
    if (file) {
      metadataContext = `
Filename: ${file.name}
File type: ${file.type}
File size: ${(file.size / 1024).toFixed(1)} KB
Last modified: ${new Date(file.lastModified).toLocaleString()}
`;
    }

    // Different API endpoints and parameters based on the selected AI service
    let apiEndpoint: string;
    let requestBody: any;
    let headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    // Configure request based on selected model service
    switch(modelService) {
      case "openai":
        apiEndpoint = "https://api.openai.com/v1/chat/completions";
        headers["Authorization"] = `Bearer ${apiKey}`;
        requestBody = {
          model: "gpt-3.5-turbo", // Use appropriate model
          messages: [
            { role: "system", content: CLASSIFICATION_PROMPTS.system },
            { role: "user", content: CLASSIFICATION_PROMPTS.user(text, metadataContext) }
          ],
          temperature: 0.3,
          max_tokens: 50
        };
        break;
        
      case "mistral":
        apiEndpoint = "https://api.mistral.ai/v1/chat/completions";
        headers["Authorization"] = `Bearer ${apiKey}`;
        requestBody = {
          model: "mistral-small", // Use appropriate model
          messages: [
            { role: "system", content: CLASSIFICATION_PROMPTS.system },
            { role: "user", content: CLASSIFICATION_PROMPTS.user(text, metadataContext) }
          ],
          temperature: 0.3,
          max_tokens: 50
        };
        break;
        
      case "claude":
        apiEndpoint = "https://api.anthropic.com/v1/complete";
        headers["Authorization"] = `Bearer ${apiKey}`;
        headers["anthropic-version"] = "2023-06-01"; // Adding required API version header
        requestBody = {
          prompt: `${CLASSIFICATION_PROMPTS.system}\n\nHuman: ${CLASSIFICATION_PROMPTS.user(text, metadataContext)}\n\nAssistant:`,
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
      headers,
      body: JSON.stringify(requestBody)
    });

    // Handle API errors with model-specific error messages
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${modelService} API error:`, errorText);
      
      // Model-specific error handling
      if (response.status === 401) {
        switch(modelService) {
          case "openai": 
            throw new Error(`OpenAI API key is invalid or has expired. Please check your API key.`);
          case "mistral": 
            throw new Error(`Mistral API authentication failed. Please verify your API key.`);
          case "claude": 
            throw new Error(`Claude API authorization failed. Please check if your API key is valid.`);
          default:
            throw new Error(`Authentication failed for ${modelService}. Please check your API key.`);
        }
      } else if (response.status === 429) {
        throw new Error(`Rate limit exceeded for ${modelService} API. Please try again later.`);
      } else {
        throw new Error(`${modelService} API request failed (${response.status}): ${errorText.slice(0, 100)}`);
      }
    }

    const data = await response.json();
    
    // Extract the classification based on the AI service's response format
    let classification: string;
    
    try {
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
        console.warn(`Invalid classification received: "${classification}". Defaulting to "Report".`);
        classification = "Report";
      }
      
      onProgressUpdate(90);
      return classification;
    } catch (error) {
      console.error("Error extracting classification from AI response:", error);
      console.log("Response data structure:", JSON.stringify(data));
      throw new Error(`Failed to extract classification from ${modelService} response: ${error instanceof Error ? error.message : String(error)}`);
    }
    
  } catch (error) {
    console.error("Classification error:", error);
    
    // Provide the error message to be displayed to the user
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to classify the document: ${errorMessage}`);
  }
};
