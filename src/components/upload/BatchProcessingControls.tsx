
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader, CheckCircle2, Ban } from "lucide-react";

interface BatchProcessingControlsProps {
  isProcessing: boolean;
  fileCount: number;
  onStartProcessing: () => void;
  onCancelProcessing: () => void;
  disabled: boolean;
}

const BatchProcessingControls: React.FC<BatchProcessingControlsProps> = ({
  isProcessing,
  fileCount,
  onStartProcessing,
  onCancelProcessing,
  disabled,
}) => {
  if (!isProcessing) {
    return (
      <Button
        className="flex-1"
        onClick={onStartProcessing}
        disabled={disabled || fileCount === 0}
      >
        <CheckCircle2 className="mr-1" />
        {`Process ${fileCount} Document${fileCount !== 1 ? 's' : ''}`}
      </Button>
    );
  }

  return (
    <>
      <Button className="flex-1" disabled variant="outline">
        <Loader className="mr-2 h-4 w-4 animate-spin" /> Processing
      </Button>
      <Button variant="destructive" onClick={onCancelProcessing}>
        <Ban className="mr-1" />
        Cancel
      </Button>
    </>
  );
};

export default BatchProcessingControls;
