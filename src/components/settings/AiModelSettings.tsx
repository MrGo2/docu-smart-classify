
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { getSupportedAiModels } from "@/services/apiKeyService";

const AiModelSettings = () => {
  const [provider, setProvider] = useState("openai");
  
  // Mock data - would be fetched from API in real implementation
  const providers = [
    { id: "openai", name: "OpenAI" },
    { id: "mistral", name: "Mistral AI" },
    { id: "claude", name: "Anthropic Claude" },
    { id: "azure", name: "Azure OpenAI" },
    { id: "google", name: "Google AI" }
  ];
  
  const modelsByProvider: Record<string, Array<{id: string, name: string}>> = {
    openai: [
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" }
    ],
    mistral: [
      { id: "mistral-large", name: "Mistral Large" },
      { id: "mistral-medium", name: "Mistral Medium" },
      { id: "mistral-small", name: "Mistral Small" }
    ],
    claude: [
      { id: "claude-3-opus", name: "Claude 3 Opus" },
      { id: "claude-3-sonnet", name: "Claude 3 Sonnet" },
      { id: "claude-3-haiku", name: "Claude 3 Haiku" }
    ],
    azure: [
      { id: "azure-gpt-4", name: "Azure GPT-4" },
      { id: "azure-gpt-35", name: "Azure GPT-3.5" }
    ],
    google: [
      { id: "gemini-pro", name: "Gemini Pro" },
      { id: "gemini-flash", name: "Gemini Flash" }
    ]
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Agent Settings</CardTitle>
        <CardDescription>
          Configure the AI model used for prompt generation and document processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="ai-provider">AI Provider</Label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger id="ai-provider">
              <SelectValue placeholder="Select AI provider" />
            </SelectTrigger>
            <SelectContent>
              {providers.map(provider => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="ai-model">AI Model</Label>
          <Select>
            <SelectTrigger id="ai-model">
              <SelectValue placeholder="Select AI model" />
            </SelectTrigger>
            <SelectContent>
              {modelsByProvider[provider]?.map(model => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Select the model that best fits your document processing needs
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <div className="flex gap-2">
            <Input
              id="api-key"
              type="password"
              placeholder="Enter API key"
              className="flex-1"
            />
            <Button variant="secondary">Verify</Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Your API key is stored securely and is never shared
          </p>
        </div>
        
        <div className="space-y-2">
          <Label>Model Parameters</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="temperature" className="text-xs">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                min="0"
                max="2"
                step="0.1"
                defaultValue="0.7"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="max-tokens" className="text-xs">Max Tokens</Label>
              <Input
                id="max-tokens"
                type="number"
                min="100"
                step="100"
                defaultValue="1000"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline">Reset to Defaults</Button>
          <Button>Save Settings</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AiModelSettings;
