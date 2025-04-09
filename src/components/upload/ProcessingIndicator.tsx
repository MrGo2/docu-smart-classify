
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProcessingIndicatorProps {
  isProcessing: boolean;
  progress: number;
  error?: string;
  statusMessage?: string;
}

const ProcessingIndicator = ({ isProcessing, progress, error, statusMessage }: ProcessingIndicatorProps) => {
  if (!isProcessing && !error) return null;
  
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
      <p className="text-xs text-center text-gray-500">
        {statusMessage || `Processing... ${progress}%`}
      </p>
    </div>
  );
};

export default ProcessingIndicator;
