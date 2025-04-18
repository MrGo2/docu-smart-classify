
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Info, FileWarning } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OcrLanguage } from "@/lib/ocr/types";

interface ProcessingIndicatorProps {
  isProcessing: boolean;
  progress: number;
  error?: string | null;
  statusMessage?: string;
  ocrLanguage?: OcrLanguage;
  detectedLanguage?: OcrLanguage | null;
  warnings?: string[];
}

const ProcessingIndicator = ({ 
  isProcessing, 
  progress, 
  error, 
  statusMessage, 
  ocrLanguage,
  detectedLanguage,
  warnings = [] 
}: ProcessingIndicatorProps) => {
  if (!isProcessing && !error && warnings.length === 0) return null;
  
  // Generate appropriate status message based on progress
  const getDetailedStatus = (progress: number) => {
    if (progress < 20) return "Initializing OCR engine...";
    if (progress < 40) return "Converting document...";
    if (progress < 70) return "Extracting text from pages...";
    if (progress < 95) return "Uploading and classifying document...";
    return "Finalizing...";
  };
  
  // Ensure progress is clamped between 0-100
  const safeProgress = Math.min(Math.max(progress || 0, 0), 100);
  
  const detailedMessage = statusMessage || getDetailedStatus(safeProgress);
  
  // Display language settings
  let languageDisplay = ocrLanguage === 'spa' ? 'Spanish' : (ocrLanguage === 'eng' ? 'English' : 'Auto-detect');
  
  // Add detected language if using auto mode and language was detected
  if (ocrLanguage === 'auto' && detectedLanguage) {
    const detected = detectedLanguage === 'spa' ? 'Spanish' : 'English';
    languageDisplay = `Auto-detect (Detected: ${detected})`;
  }
  
  return (
    <div className="space-y-2">
      {isProcessing && <Progress value={safeProgress} className="h-2" />}
      
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {warnings.length > 0 && (
        <Alert className="mt-2 bg-amber-50 border-amber-200 text-amber-800">
          <FileWarning className="h-4 w-4 mr-2 text-amber-500" />
          <AlertDescription>
            {warnings.length === 1 
              ? warnings[0] 
              : `${warnings.length} files had processing issues`}
          </AlertDescription>
        </Alert>
      )}
      
      {isProcessing && (
        <div className="flex items-center justify-center text-xs text-gray-500">
          <p>{detailedMessage} ({safeProgress}%)</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 ml-1 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">OCR Language: {languageDisplay}</p>
                <p className="text-xs">Using PaddleOCR engine</p>
                <p className="text-xs">Complex documents and scanned PDFs may take longer to process</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};

export default ProcessingIndicator;
