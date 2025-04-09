
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createWorker } from "tesseract.js";

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

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  const needsOcr = (file: File) => {
    const ext = getFileExtension(file.name);
    return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'pdf';
  };

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
  }, [onProcessingError]);

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

  const performOcr = async (file: File) => {
    try {
      setProgress(10);
      const worker = await createWorker('eng');
      setProgress(20);
      
      // Convert the file to an image format that Tesseract can process
      const fileUrl = URL.createObjectURL(file);
      setProgress(30);
      
      // Process only the first 30% of the page (conditional OCR)
      // Note: This is a simplification, in a real implementation you'd need to 
      // manipulate the image to extract just the top portion
      const { data } = await worker.recognize(fileUrl);
      setProgress(60);
      
      await worker.terminate();
      setProgress(70);
      
      return data.text;
    } catch (error) {
      console.error("OCR error:", error);
      throw new Error("Failed to extract text from the document");
    }
  };

  const classifyDocument = async (text: string, apiKey: string, modelService: string) => {
    try {
      // Simplified for demo - in a real app you would call the actual AI service API
      // This function mimics sending text to an AI model for classification
      setProgress(80);
      
      // Simulate AI classification
      // In a real application, you would make an API call to the selected AI service
      const classifications = [
        "Invoice", 
        "Resume", 
        "Contract", 
        "Report", 
        "Form", 
        "Receipt", 
        "Letter"
      ];
      const randomClassification = 
        classifications[Math.floor(Math.random() * classifications.length)];
      
      setProgress(90);
      return randomClassification;
    } catch (error) {
      console.error("Classification error:", error);
      throw new Error("Failed to classify the document");
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
      
      // 2. Upload file to Supabase Storage
      const fileExt = getFileExtension(file.name);
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const storagePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storagePath, file);
        
      if (uploadError) throw new Error("Failed to upload document");
      setProgress(20);
      
      // 3. Extract text if needed
      let extractedText = "";
      if (needsOcr(file)) {
        extractedText = await performOcr(file);
      }
      
      // 4. Classify the document
      const classification = await classifyDocument(extractedText, apiKey, modelSelection);
      setProgress(95);
      
      // 5. Save document metadata to the database
      const { error: insertError } = await supabase.from("documents").insert({
        filename: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: storagePath,
        classification: classification,
        extracted_text: extractedText,
        ocr_processed: needsOcr(file),
      });
      
      if (insertError) throw new Error("Failed to save document metadata");
      
      setProgress(100);
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
