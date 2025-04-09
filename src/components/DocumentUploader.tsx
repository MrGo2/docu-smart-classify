
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import FileUploadArea from "@/components/upload/FileUploadArea";
import ModelSelector from "@/components/upload/ModelSelector";
import ProcessingIndicator from "@/components/upload/ProcessingIndicator";
import { useDocumentProcessing } from "@/hooks/useDocumentProcessing";

interface DocumentUploaderProps {
  isProcessing: boolean;
  onProcessingStart: () => void;
  onProcessingComplete: () => void;
  onProcessingError: (error: string) => void;
}

const DocumentUploader = ({
  onProcessingStart,
  onProcessingComplete,
  onProcessingError,
}: DocumentUploaderProps) => {
  const {
    file,
    modelSelection,
    progress,
    isProcessing,
    supportedTypes,
    setModelSelection,
    handleFileSelect,
    processDocument
  } = useDocumentProcessing(
    onProcessingStart,
    onProcessingComplete,
    onProcessingError
  );

  return (
    <div className="space-y-4">
      <ModelSelector 
        value={modelSelection} 
        onChange={setModelSelection} 
        disabled={isProcessing} 
      />

      <FileUploadArea
        supportedTypes={supportedTypes}
        file={file}
        onFileSelect={handleFileSelect}
        onError={onProcessingError}
        isDisabled={isProcessing}
      />

      <ProcessingIndicator 
        isProcessing={isProcessing} 
        progress={progress} 
      />

      <div className="flex justify-end">
        <Button
          onClick={processDocument}
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
