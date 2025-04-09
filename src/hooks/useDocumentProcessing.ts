
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { performOcr, needsOcr } from "@/utils/ocrProcessor";
import { classifyDocument } from "@/services/aiClassifier";
import { uploadDocumentToStorage } from "@/services/documentStorage";

export const useDocumentProcessing = (
  onProcessingStart: () => void,
  onProcessingComplete: () => void,
  onProcessingError: (error: string) => void
) => {
  const [file, setFile] = useState<File | null>(null);
  const [modelSelection, setModelSelection] = useState<string>("openai");
  const [progress, setProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const supportedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setProgress(0);
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

  const processDocument = async () => {
    if (!file) return;

    setIsProcessing(true);
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
    progress,
    isProcessing,
    supportedTypes,
    setModelSelection,
    handleFileSelect,
    processDocument
  };
};
