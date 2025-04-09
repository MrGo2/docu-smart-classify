
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ApiKey {
  id: string;
  service: string;
  api_key: string;
  is_default: boolean;
}

const ApiKeyManager = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newKeyData, setNewKeyData] = useState({
    service: "openai",
    api_key: "",
  });

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("service", { ascending: true });

      if (error) throw error;
      setKeys(data || []);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = async () => {
    if (!newKeyData.api_key.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    try {
      setAdding(true);

      // Check if this is the first key for this service (make it default)
      const isFirstKey = !keys.some(key => key.service === newKeyData.service);

      const { error } = await supabase.from("api_keys").insert({
        service: newKeyData.service,
        api_key: newKeyData.api_key,
        is_default: isFirstKey,
      });

      if (error) throw error;

      toast.success("API key added successfully");
      setNewKeyData({ service: "openai", api_key: "" });
      fetchApiKeys();
    } catch (error) {
      console.error("Error adding API key:", error);
      toast.error("Failed to add API key");
    } finally {
      setAdding(false);
    }
  };

  const handleSetDefault = async (id: string, service: string) => {
    try {
      // First unset all defaults for this service
      await supabase.from("api_keys")
        .update({ is_default: false })
        .eq("service", service);
      
      // Then set the selected key as default
      await supabase.from("api_keys")
        .update({ is_default: true })
        .eq("id", id);

      toast.success("Default API key updated");
      fetchApiKeys();
    } catch (error) {
      console.error("Error setting default API key:", error);
      toast.error("Failed to update default API key");
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      // Check if this is the default key
      const keyToDelete = keys.find(k => k.id === id);
      
      const { error } = await supabase.from("api_keys").delete().eq("id", id);
      if (error) throw error;

      toast.success("API key deleted");
      fetchApiKeys();
      
      // If we deleted a default key, we might need to set a new default
      if (keyToDelete?.is_default) {
        const remainingKeysForService = keys.filter(k => 
          k.service === keyToDelete.service && k.id !== id
        );
        
        if (remainingKeysForService.length > 0) {
          // Set the first remaining key as default
          await handleSetDefault(remainingKeysForService[0].id, keyToDelete.service);
        }
      }
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast.error("Failed to delete API key");
    }
  };

  const formatKeyDisplay = (key: string): string => {
    // Display only the first 4 and last 4 characters
    if (key.length <= 8) return '••••••••';
    return `${key.substring(0, 4)}••••••${key.substring(key.length - 4)}`;
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="service">AI Service</Label>
          <Select
            value={newKeyData.service}
            onValueChange={(value) => setNewKeyData({ ...newKeyData, service: value })}
          >
            <SelectTrigger id="service">
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="mistral">Mistral</SelectItem>
              <SelectItem value="claude">Claude</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="apiKey">API Key</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your API key"
              value={newKeyData.api_key}
              onChange={(e) => setNewKeyData({ ...newKeyData, api_key: e.target.value })}
            />
            <Button
              onClick={handleAddKey}
              disabled={adding || !newKeyData.api_key.trim()}
            >
              {adding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="hidden md:inline ml-1">Add Key</span>
            </Button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <p>Loading API keys...</p>
        </div>
      ) : keys.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <p>No API keys configured yet</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead className="text-center">Default</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">
                    {key.service === "openai" && "OpenAI"}
                    {key.service === "mistral" && "Mistral"}
                    {key.service === "claude" && "Claude"}
                  </TableCell>
                  <TableCell className="font-mono">{formatKeyDisplay(key.api_key)}</TableCell>
                  <TableCell className="text-center">
                    {key.is_default ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Default</span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetDefault(key.id, key.service)}
                      >
                        Set Default
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteKey(key.id)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        <p>
          * API keys are stored directly in your Supabase database. Test an API key by uploading a document.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyManager;
