
import React from "react";
import { useDocumentProcessing } from "@/hooks/useDocumentProcessing";
import { Button } from "@/components/ui/button";
import FileUploadArea from "@/components/upload/FileUploadArea";
import ModelSelector from "@/components/upload/ModelSelector";
import ProcessingIndicator from "@/components/upload/ProcessingIndicator";
import LanguageSelector from "@/components/upload/LanguageSelector";
import ProjectSelector from "@/components/projects/ProjectSelector";
import ExtractionStrategySelector from "@/components/upload/ExtractionStrategySelector";

interface DocumentUploaderProps {
  onProcessingStart: () => void;
  onProcessingComplete: () => void;
  onProcessingError: (error: string) => void;
  isProcessing: boolean;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onProcessingStart,
  onProcessingComplete,
  onProcessingError,
  isProcessing,
}) => {
  const {
    file,
    modelSelection,
    ocrLanguage,
    extractionStrategy,
    progress,
    statusMessage,
    supportedTypes,
    selectedProject,
    detectedLanguage,
    setModelSelection,
    setOcrLanguage,
    setExtractionStrategy,
    setSelectedProject,
    handleFileSelect,
    processDocument,
  } = useDocumentProcessing(
    onProcessingStart,
    onProcessingComplete,
    onProcessingError
  );

  // Create a handler function that conforms to the onClick type
  const handleProcessDocument = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    processDocument();
  };

  return (
    <div className="space-y-4">
      <ProjectSelector
        selectedProject={selectedProject}
        onChange={setSelectedProject}
        disabled={isProcessing}
      />
      
      <FileUploadArea
        supportedTypes={supportedTypes}
        file={file}
        onFileSelect={handleFileSelect}
        onError={onProcessingError}
        isDisabled={isProcessing}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ModelSelector
          value={modelSelection}
          onChange={setModelSelection}
          disabled={isProcessing || !file}
        />
        
        <LanguageSelector
          value={ocrLanguage}
          onChange={setOcrLanguage}
          disabled={isProcessing || !file}
        />
      </div>
      
      <ExtractionStrategySelector
        value={extractionStrategy}
        onChange={setExtractionStrategy}
        disabled={isProcessing || !file}
      />
      
      <Button
        className="w-full"
        onClick={handleProcessDocument}
        disabled={isProcessing || !file || !selectedProject}
      >
        {isProcessing ? "Processing..." : "Process Document"}
      </Button>
      
      <ProcessingIndicator
        isProcessing={isProcessing}
        progress={progress}
        statusMessage={statusMessage}
        ocrLanguage={ocrLanguage}
        detectedLanguage={detectedLanguage}
      />
    </div>
  );
};

export default DocumentUploader;
