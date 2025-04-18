
import { useState } from "react";

export const useProcessingState = () => {
  const [progress, setProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  return {
    progress,
    isProcessing,
    statusMessage,
    setProgress,
    setIsProcessing,
    setStatusMessage,
  };
};
