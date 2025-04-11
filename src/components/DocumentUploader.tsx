
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import FileUploadArea from "@/components/upload/FileUploadArea";
import ModelSelector from "@/components/upload/ModelSelector";
import ProcessingIndicator from "@/components/upload/ProcessingIndicator";
import { useDocumentProcessing } from "@/hooks/useDocumentProcessing";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { getAvailableOcrLanguages } from "@/utils/ocrProcessor";

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
    ocrLanguage,
    progress,
    isProcessing,
    statusMessage,
    supportedTypes,
    setModelSelection,
    setOcrLanguage,
    handleFileSelect,
    processDocument
  } = useDocumentProcessing(
    onProcessingStart,
    onProcessingComplete,
    onProcessingError
  );

  const availableLanguages = getAvailableOcrLanguages();

  return (
    <div className="space-y-4">
      <ModelSelector 
        value={modelSelection} 
        onChange={setModelSelection} 
        disabled={isProcessing} 
      />

      <div className="flex flex-col space-y-2">
        <label htmlFor="language-select" className="text-sm font-medium">
          OCR Language
        </label>
        <Select
          value={ocrLanguage}
          onValueChange={(value) => setOcrLanguage(value as 'spa' | 'eng')}
          disabled={isProcessing}
        >
          <SelectTrigger id="language-select" className="w-full">
            <SelectValue placeholder="Select OCR language" />
          </SelectTrigger>
          <SelectContent>
            {availableLanguages.map((language) => (
              <SelectItem key={language.value} value={language.value}>
                {language.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Select the language of the document for better OCR results
        </p>
      </div>

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
        statusMessage={statusMessage}
        ocrLanguage={ocrLanguage}
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
