
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { performOcr, needsOcr } from "@/utils/ocrProcessor";
import { classifyDocument } from "@/services/aiClassifier";
import { uploadDocumentToStorage } from "@/services/documentStorage";

interface DocumentUploaderProps {
  isProcessing: boolean;
  onProcessingStart: () => void;
  onProcessingComplete: () => void;
  onProcessingError: (error: string) => void;
}

const DocumentUploader = ({
  isProcessing,
  onProcessingStart,
  onProcessingComplete,
  onProcessingError,
}: DocumentUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [modelSelection, setModelSelection] = useState<string>("openai");
  const [progress, setProgress] = useState<number>(0);

  const supportedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const selectedFile = acceptedFiles[0];
    
    // Verify file type
    if (!supportedTypes.includes(selectedFile.type)) {
      onProcessingError(
        "Unsupported file type. Please upload a PDF, image, or Office document."
      );
      return;
    }
    
    setFile(selectedFile);
    setProgress(0);
  }, [onProcessingError, supportedTypes]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  const getApiKey = async (service: string) => {
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .select("api_key")
        .eq("service", service)
        .eq("is_default", true)
        .single();

      if (error) throw error;
      return data?.api_key;
    } catch (error) {
      console.error("Error fetching API key:", error);
      return null;
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    
    onProcessingStart();
    setProgress(0);
    
    try {
      // 1. Get the selected model's API key
      const apiKey = await getApiKey(modelSelection);
      if (!apiKey) {
        throw new Error(`No API key configured for ${modelSelection}. Please add one first.`);
      }
      
      setProgress(5);
      
      // 2. Extract text if needed using OCR
      let extractedText = "";
      if (needsOcr(file)) {
        extractedText = await performOcr(file, setProgress);
      }
      
      // 3. Classify the document using AI
      const classification = await classifyDocument(
        extractedText, 
        apiKey, 
        modelSelection,
        setProgress
      );
      
      // 4. Upload document and save metadata
      await uploadDocumentToStorage(
        file, 
        classification, 
        extractedText, 
        needsOcr(file),
        setProgress
      );
      
      setFile(null);
      onProcessingComplete();
    } catch (error: any) {
      console.error("Processing error:", error);
      onProcessingError(error.message || "An unknown error occurred");
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <Label htmlFor="model">AI Model for Classification</Label>
        <Select
          value={modelSelection}
          onValueChange={setModelSelection}
          disabled={isProcessing}
        >
          <SelectTrigger id="model">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="mistral">Mistral</SelectItem>
            <SelectItem value="claude">Claude</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-primary"
        } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-8 w-8 text-gray-500" />
          {file ? (
            <p className="text-sm">
              Selected: <span className="font-semibold">{file.name}</span>{" "}
              ({(file.size / 1024).toFixed(1)} KB)
            </p>
          ) : isDragActive ? (
            <p>Drop the file here...</p>
          ) : (
            <p>Drag & drop a document, or click to select</p>
          )}
          <p className="text-xs text-gray-500">
            Supported formats: PDF, JPG, PNG, DOCX
          </p>
        </div>
      </div>

      {isProcessing && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-gray-500">
            Processing... {progress}%
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleFileUpload}
          disabled={!file || isProcessing}
          className="w-full md:w-auto"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Process Document"
          )}
        </Button>
      </div>
    </div>
  );
};

export default DocumentUploader;
