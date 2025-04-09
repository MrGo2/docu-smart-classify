
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

type ApiKey = {
  id: string;
  service: string;
  api_key: string;
  is_default: boolean;
};

const ApiKeyManager = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newService, setNewService] = useState("openai");
  const [newApiKey, setNewApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch stored API keys
  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase.from("api_keys").select("*");
      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast.error("Failed to load API keys");
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  // Save a new API key
  const handleSaveApiKey = async () => {
    if (!newApiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    setIsLoading(true);
    try {
      // Check if this is the first key for this service, if so mark it as default
      const existingKeysForService = apiKeys.filter(key => key.service === newService);
      const isDefault = existingKeysForService.length === 0;

      const { error } = await supabase.from("api_keys").insert({
        service: newService,
        api_key: newApiKey,
        is_default: isDefault,
      });

      if (error) throw error;

      toast.success(`API key for ${newService} saved successfully`);
      setNewApiKey("");
      fetchApiKeys();
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Failed to save API key");
    } finally {
      setIsLoading(false);
    }
  };

  // Set a key as default for its service
  const handleSetDefault = async (id: string, service: string) => {
    setIsLoading(true);
    try {
      // First, unset the default flag for all keys of this service
      await supabase
        .from("api_keys")
        .update({ is_default: false })
        .eq("service", service);

      // Then set the selected key as default
      const { error } = await supabase
        .from("api_keys")
        .update({ is_default: true })
        .eq("id", id);

      if (error) throw error;

      toast.success(`Default ${service} API key updated`);
      fetchApiKeys();
    } catch (error) {
      console.error("Error setting default key:", error);
      toast.error("Failed to update default key");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an API key
  const handleDeleteKey = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("api_keys").delete().eq("id", id);
      if (error) throw error;

      toast.success("API key deleted");
      fetchApiKeys();
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast.error("Failed to delete API key");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Add New API Key Form */}
      <div className="flex flex-col space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <Label htmlFor="service">Service</Label>
            <Select value={newService} onValueChange={setNewService}>
              <SelectTrigger id="service">
                <SelectValue placeholder="Select Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="mistral">Mistral</SelectItem>
                <SelectItem value="claude">Claude</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="apikey">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="apikey"
                type="password"
                placeholder="Enter your API key"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
              />
              <Button onClick={handleSaveApiKey} disabled={isLoading}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Display Existing API Keys */}
      {apiKeys.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-2">Saved API Keys</h3>
          <div className="border rounded-md">
            {apiKeys.map((key) => (
              <div 
                key={key.id}
                className="flex items-center justify-between p-3 border-b last:border-b-0"
              >
                <div>
                  <span className="font-medium capitalize">{key.service}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    •••••••{key.api_key.substring(key.api_key.length - 4)}
                  </span>
                  {key.is_default && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!key.is_default && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetDefault(key.id, key.service)}
                      disabled={isLoading}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteKey(key.id)}
                    disabled={isLoading}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyManager;
