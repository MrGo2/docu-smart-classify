
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

  // Ensure progress values are clamped between 0-100
  const safeOverallProgress = Math.min(Math.max(overallProgress || 0, 0), 100);
  const safeFileProgress = Math.min(Math.max(fileProgress || 0, 0), 100);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Overall Progress</span>
          <span>{safeOverallProgress}%</span>
        </div>
        <Progress value={safeOverallProgress} className="h-2" />
      </div>

      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Current File: {currentFileName}</span>
            <span>{safeFileProgress}%</span>
          </div>
          <ProcessingIndicator
            isProcessing={isProcessing}
            progress={safeFileProgress}
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
