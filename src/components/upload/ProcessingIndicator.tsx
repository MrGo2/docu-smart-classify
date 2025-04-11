
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OcrLanguage } from "@/lib/ocr/types";

interface ProcessingIndicatorProps {
  isProcessing: boolean;
  progress: number;
  error?: string;
  statusMessage?: string;
  ocrLanguage?: OcrLanguage;
}

const ProcessingIndicator = ({ isProcessing, progress, error, statusMessage, ocrLanguage }: ProcessingIndicatorProps) => {
  if (!isProcessing && !error) return null;
  
  // Generate appropriate status message based on progress
  const getDetailedStatus = (progress: number) => {
    if (progress < 20) return "Initializing OCR engine...";
    if (progress < 40) return "Converting document...";
    if (progress < 70) return "Extracting text from pages...";
    if (progress < 95) return "Uploading and classifying document...";
    return "Finalizing...";
  };
  
  const detailedMessage = statusMessage || getDetailedStatus(progress);
  const languageDisplay = ocrLanguage === 'spa' ? 'Spanish' : 'English';
  
  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-2">
      <Progress value={progress} className="h-2" />
      <div className="flex items-center justify-center text-xs text-gray-500">
        <p>{detailedMessage} ({progress}%)</p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 ml-1 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">OCR Language: {languageDisplay}</p>
              <p className="text-xs">Complex documents and scanned PDFs may take longer to process</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ProcessingIndicator;
