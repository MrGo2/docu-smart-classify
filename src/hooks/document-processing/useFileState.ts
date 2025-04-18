
import { useState } from "react";
import { ExtractionStrategy } from "@/lib/extraction/types";
import { OcrLanguage } from "@/lib/ocr/types";

export const useFileState = () => {
  const [file, setFile] = useState<File | null>(null);
  const [modelSelection, setModelSelection] = useState<string>("openai");
  const [ocrLanguage, setOcrLanguage] = useState<OcrLanguage>("auto");
  const [ocrProvider, setOcrProvider] = useState<string>("paddleocr");
  const [extractionStrategy, setExtractionStrategy] = useState<ExtractionStrategy>(
    ExtractionStrategy.FIRST_PAGE
  );
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [detectedLanguage, setDetectedLanguage] = useState<OcrLanguage | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
  };

  return {
    file,
    setFile,
    modelSelection,
    ocrLanguage,
    ocrProvider,
    extractionStrategy,
    selectedProject,
    detectedLanguage,
    setModelSelection,
    setOcrLanguage,
    setOcrProvider,
    setExtractionStrategy,
    setSelectedProject,
    setDetectedLanguage,
    handleFileSelect,
  };
};
