
import { Progress } from "@/components/ui/progress";

interface ProcessingIndicatorProps {
  isProcessing: boolean;
  progress: number;
}

const ProcessingIndicator = ({ isProcessing, progress }: ProcessingIndicatorProps) => {
  if (!isProcessing) return null;
  
  return (
    <div className="space-y-2">
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-center text-gray-500">
        Processing... {progress}%
      </p>
    </div>
  );
};

export default ProcessingIndicator;
