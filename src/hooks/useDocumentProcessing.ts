
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { performOcr, needsOcr } from "@/utils/ocrProcessor";
import { classifyDocument } from "@/services/aiClassifier";
import { uploadDocumentToStorage } from "@/services/documentStorage";
import { OcrLanguage } from "@/lib/ocr/types";

export const useDocumentProcessing = (
  onProcessingStart: () => void,
  onProcessingComplete: () => void,
  onProcessingError: (error: string) => void
) => {
  const [file, setFile] = useState<File | null>(null);
  const [modelSelection, setModelSelection] = useState<string>("openai");
  const [ocrLanguage, setOcrLanguage] = useState<OcrLanguage>("spa"); // Default to Spanish
  const [progress, setProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const supportedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  
  const canExtractContent = (fileType: string): boolean => {
    return supportedTypes.includes(fileType);
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setProgress(0);
    setStatusMessage("");
  };

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

  const processDocument = async (documentFile?: File) => {
    const fileToProcess = documentFile || file;
    if (!fileToProcess) return;

    setIsProcessing(true);
    onProcessingStart();
    setProgress(0);

    try {
      // 1. Get the selected model's API key
      setStatusMessage("Getting API key...");
      const apiKey = await getApiKey(modelSelection);
      if (!apiKey) {
        throw new Error(`No API key configured for ${modelSelection}. Please add one first.`);
      }

      setProgress(5);

      // Check if file type is supported for content extraction
      const isContentExtractable = canExtractContent(fileToProcess.type);

      // 2. Extract text if needed using OCR (only for supported file types)
      let extractedText = "";
      if (isContentExtractable) {
        if (needsOcr(fileToProcess)) {
          setStatusMessage(`Performing OCR text extraction with ${ocrLanguage === 'spa' ? 'Spanish' : 'English'} language model...`);
          extractedText = await performOcr(fileToProcess, (ocrProgress) => {
            // Scale OCR progress from 5% to 75% of the overall process
            const scaledProgress = 5 + Math.floor(ocrProgress * 0.7);
            setProgress(scaledProgress);
            
            if (ocrProgress < 40) {
              setStatusMessage(`Initializing ${ocrLanguage === 'spa' ? 'Spanish' : 'English'} OCR engine...`);
            } else if (ocrProgress < 70) {
              setStatusMessage("Extracting text from document pages...");
            } else {
              setStatusMessage("Finalizing text extraction...");
            }
          }, ocrLanguage);
        } else if (fileToProcess.type.includes("word")) {
          setStatusMessage("Extracting text from Word document...");
          // For Word documents, we could implement text extraction here
          // For now we'll just set a placeholder
          extractedText = "Text extraction from Word documents not implemented";
          setProgress(75);
        }
      } else {
        // For unsupported file types, we'll just use metadata
        setStatusMessage("Unsupported file type for content extraction, using metadata only...");
        setProgress(75);
      }

      // 3. Classify the document using AI based on extracted text and metadata
      setStatusMessage("Classifying document with AI...");
      const classification = await classifyDocument(
        extractedText,
        apiKey,
        modelSelection,
        (classifyProgress) => {
          // Scale classification progress from 75% to 90% of the overall process
          const scaledProgress = 75 + Math.floor(classifyProgress * 0.15);
          setProgress(scaledProgress);
        },
        fileToProcess
      );

      // 4. Upload document and save metadata
      setStatusMessage("Saving document to storage...");
      await uploadDocumentToStorage(
        fileToProcess,
        classification,
        extractedText,
        needsOcr(fileToProcess) && isContentExtractable,
        (uploadProgress) => {
          // Scale upload progress from 90% to 100% of the overall process
          const scaledProgress = 90 + Math.floor(uploadProgress * 0.1);
          setProgress(scaledProgress);
        },
        selectedProject
      );

      setStatusMessage("Processing complete!");
      setFile(null);
      setIsProcessing(false);
      onProcessingComplete();
    } catch (error: any) {
      console.error("Processing error:", error);
      setIsProcessing(false);
      onProcessingError(error.message || "An unknown error occurred");
    }
  };

  return {
    file,
    modelSelection,
    ocrLanguage,
    progress,
    isProcessing,
    statusMessage,
    supportedTypes,
    selectedProject,
    setModelSelection,
    setOcrLanguage,
    setSelectedProject,
    handleFileSelect,
    processDocument
  };
};
