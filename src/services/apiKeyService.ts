
import { supabase } from "@/integrations/supabase/client";

/**
 * Service for managing API keys
 */
export const fetchApiKey = async (service: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from("api_keys")
      .select("api_key")
      .eq("service", service)
      .eq("is_default", true)
      .single();

    if (error) {
      console.error("Error fetching API key:", error);
      return null;
    }
    
    return data?.api_key || null;
  } catch (error) {
    console.error("Error fetching API key:", error);
    return null;
  }
};

export const getSupportedAiModels = () => [
  { id: "openai", name: "OpenAI" },
  { id: "mistral", name: "Mistral" },
  { id: "claude", name: "Claude" }
];
