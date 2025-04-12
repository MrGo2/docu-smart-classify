
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectFormProps {
  initialData?: {
    id?: string;
    name: string;
    client_name?: string;
    description?: string;
    default_ocr_language: string;
    default_ocr_provider: string;
    default_ai_model?: string;
  };
  onComplete: () => void;
}

const ProjectForm = ({ initialData, onComplete }: ProjectFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    client_name: initialData?.client_name || "",
    description: initialData?.description || "",
    default_ocr_language: initialData?.default_ocr_language || "eng",
    default_ocr_provider: initialData?.default_ocr_provider || "tesseract",
    default_ai_model: initialData?.default_ai_model || "openai"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (initialData?.id) {
        // Update existing project
        const { error } = await supabase
          .from("projects")
          .update(formData)
          .eq("id", initialData.id);

        if (error) throw error;
        toast.success("Project updated successfully");
      } else {
        // Create new project
        const { error } = await supabase
          .from("projects")
          .insert(formData);

        if (error) throw error;
        toast.success("Project created successfully");
      }

      onComplete();
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error(`Failed to save project: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Project Name *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter project name"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="client_name">Client Name</Label>
        <Input
          id="client_name"
          name="client_name"
          value={formData.client_name}
          onChange={handleInputChange}
          placeholder="Enter client name (optional)"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter project description (optional)"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="default_ocr_language">Default OCR Language</Label>
          <Select 
            value={formData.default_ocr_language}
            onValueChange={(value) => handleSelectChange("default_ocr_language", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eng">English</SelectItem>
              <SelectItem value="spa">Spanish</SelectItem>
              <SelectItem value="fra">French</SelectItem>
              <SelectItem value="deu">German</SelectItem>
              <SelectItem value="ita">Italian</SelectItem>
              <SelectItem value="por">Portuguese</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="default_ocr_provider">Default OCR Provider</Label>
          <Select 
            value={formData.default_ocr_provider}
            onValueChange={(value) => handleSelectChange("default_ocr_provider", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select OCR provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tesseract">Tesseract</SelectItem>
              <SelectItem value="azure">Azure</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="default_ai_model">Default AI Model</Label>
        <Select 
          value={formData.default_ai_model}
          onValueChange={(value) => handleSelectChange("default_ai_model", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select AI model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="gemini">Gemini</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="submit" 
          disabled={isSubmitting || !formData.name.trim()}
        >
          {isSubmitting ? "Saving..." : initialData?.id ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
