
import React from "react";
import { Progress } from "@/components/ui/progress";
import ProcessingIndicator from "@/components/upload/ProcessingIndicator";
import { OcrLanguage } from "@/lib/ocr/types";

interface BatchProgressDisplayProps {
  isProcessing: boolean;
  overallProgress: number;
  currentFileName: string;
  fileProgress: number;
  statusMessage?: string;
  ocrLanguage?: OcrLanguage;
  processingError: string | null;
  failedFiles: { name: string; error: string }[];
}

const BatchProgressDisplay: React.FC<BatchProgressDisplayProps> = ({
  isProcessing,
  overallProgress,
  currentFileName,
  fileProgress,
  statusMessage,
  ocrLanguage,
  processingError,
  failedFiles,
}) => {
  if (!isProcessing && failedFiles.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Overall Progress</span>
          <span>{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Current File: {currentFileName}</span>
            <span>{fileProgress}%</span>
          </div>
          <ProcessingIndicator
            isProcessing={isProcessing}
            progress={fileProgress}
            statusMessage={statusMessage}
            ocrLanguage={ocrLanguage}
            error={processingError}
            warnings={failedFiles.map((f) => `Failed: ${f.name}`)}
          />
        </div>
      )}
    </div>
  );
};

export default BatchProgressDisplay;
