
import { useState, useEffect, useCallback, useRef } from "react";
import { OcrLanguage } from "@/lib/ocr/types";
import { ExtractionStrategy } from "@/lib/extraction/types";

type BatchProcessorOptions = {
  processDocument: (file: File) => Promise<void>;
  fileProgress: number;
  statusMessage: string;
  ocrLanguage: OcrLanguage;
};

type FailedFile = {
  name: string;
  error: string;
};

export const useBatchProcessor = ({
  processDocument,
  fileProgress,
  statusMessage,
  ocrLanguage,
}: BatchProcessorOptions) => {
  // File management
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [failedFiles, setFailedFiles] = useState<FailedFile[]>([]);
  const processingCancelled = useRef(false);

  // Handle file selection
  const handleFilesSelect = useCallback((selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
  }, []);

  // Handle file removal
  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Calculate overall progress based on current file index and current file progress
  const calculateOverallProgress = useCallback(() => {
    if (files.length === 0) return 0;

    const fileContribution = 100 / files.length;
    return Math.floor(
      currentFileIndex * fileContribution + (fileProgress * fileContribution) / 100
    );
  }, [currentFileIndex, fileProgress, files.length]);

  // Update overall progress whenever file progress or current index changes
  useEffect(() => {
    if (isProcessing) {
      setOverallProgress(calculateOverallProgress());
    }
  }, [isProcessing, calculateOverallProgress]);

  // Handler for file completion (success or error)
  const handleFileComplete = useCallback(
    (success: boolean) => {
      if (processingCancelled.current) {
        // If processing was cancelled, reset everything
        setProcessingError(null);
        processingCancelled.current = false;
        setIsProcessing(false);
        setOverallProgress(0);
        return "cancelled";
      }

      if (currentFileIndex < files.length - 1) {
        // Process next file after a short delay
        setTimeout(() => {
          setCurrentFileIndex((prev) => prev + 1);
          setProcessingError(null);
        }, 500);
        return "continue";
      } else {
        // All files processed
        setIsProcessing(false);
        setProcessingError(null);

        // Complete the progress indicator
        setOverallProgress(100);
        return "complete";
      }
    },
    [currentFileIndex, files.length]
  );

  // Start processing all documents
  const startBatchProcessing = useCallback(() => {
    if (!files.length) return;

    setIsProcessing(true);
    setCurrentFileIndex(0);
    setOverallProgress(0);
    setProcessingError(null);
    setFailedFiles([]);
    processingCancelled.current = false;

    // The useEffect watching currentFileIndex will trigger the first document process
  }, [files.length]);

  // Cancel ongoing processing
  const cancelBatchProcessing = useCallback(() => {
    processingCancelled.current = true;
    return "Cancelling after current file completes...";
  }, []);

  // Handle successful file processing
  const onFileProcessed = useCallback(() => {
    const result = handleFileComplete(true);
    return result;
  }, [handleFileComplete]);

  // Handle file processing error
  const onFileError = useCallback(
    (error: string) => {
      const currentFileName = files[currentFileIndex]?.name || "Unknown file";

      // Track failed files
      setFailedFiles((prev) => [
        ...prev,
        {
          name: currentFileName,
          error: error,
        },
      ]);

      // Set error state for display
      setProcessingError(error);

      // Continue with next file despite error
      const result = handleFileComplete(false);
      return result;
    },
    [files, currentFileIndex, handleFileComplete]
  );

  // Process the next file in the queue when currentFileIndex changes
  useEffect(() => {
    if (isProcessing && files[currentFileIndex] && !processingCancelled.current) {
      const processCurrentFile = async () => {
        try {
          await processDocument(files[currentFileIndex]);
        } catch (error) {
          console.error("Error in batch processing:", error);
          
          // If processDocument throws (it shouldn't due to internal error handling),
          // continue to the next file
          handleFileComplete(false);
        }
      };
      
      processCurrentFile();
    }
  }, [currentFileIndex, files, isProcessing, processDocument, handleFileComplete]);

  // Reset failed files when starting a new batch
  useEffect(() => {
    if (!isProcessing) {
      setFailedFiles([]);
    }
  }, [isProcessing]);

  return {
    files,
    isProcessing,
    currentFileIndex,
    overallProgress,
    processingError,
    failedFiles,
    handleFilesSelect,
    handleRemoveFile,
    startBatchProcessing,
    cancelBatchProcessing,
    onFileProcessed,
    onFileError,
  };
};
