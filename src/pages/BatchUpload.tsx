
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Loader, X, CheckCircle2, Ban } from "lucide-react";
import { useDocumentProcessing } from "@/hooks/useDocumentProcessing";
import MultiFileUploadArea from "@/components/upload/MultiFileUploadArea";
import ModelSelector from "@/components/upload/ModelSelector";
import LanguageSelector from "@/components/upload/LanguageSelector";
import ProcessingIndicator from "@/components/upload/ProcessingIndicator";
import ProjectSelector from "@/components/projects/ProjectSelector";
import ExtractionStrategySelector from "@/components/upload/ExtractionStrategySelector";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ExtractionStrategy } from "@/lib/extraction/types";

// Constants
const MAX_BATCH_FILES = 20;

const BatchUpload = () => {
  // File management
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [extractionStrategy, setExtractionStrategy] = useState<ExtractionStrategy>(ExtractionStrategy.FIRST_PAGE);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [failedFiles, setFailedFiles] = useState<{name: string, error: string}[]>([]);
  const processingCancelled = useRef(false);
  
  const {
    modelSelection,
    ocrLanguage,
    progress: fileProgress,
    statusMessage,
    supportedTypes,
    selectedProject,
    setModelSelection,
    setOcrLanguage,
    setSelectedProject,
    setExtractionStrategy: setDocProcessingExtractionStrategy,
    processDocument,
  } = useDocumentProcessing(
    () => {},
    () => {
      // When current file completes successfully
      handleFileComplete(true);
    },
    (error) => {
      // When current file encounters an error
      const currentFileName = files[currentFileIndex]?.name || "Unknown file";
      
      // Track failed files
      setFailedFiles(prev => [...prev, {
        name: currentFileName,
        error: error
      }]);
      
      // Show toast for the error
      toast.error(`Error processing "${currentFileName}": ${error}`);
      
      // Set error state for display
      setProcessingError(error);
      
      // Continue with next file despite error
      handleFileComplete(false);
    }
  );

  // Reset failed files when starting a new batch
  useEffect(() => {
    if (!isProcessing) {
      setFailedFiles([]);
    }
  }, [isProcessing]);

  // Handler for file completion (success or error)
  const handleFileComplete = useCallback((success: boolean) => {
    if (processingCancelled.current) {
      // If processing was cancelled, reset everything
      setProcessingError(null);
      processingCancelled.current = false;
      setIsProcessing(false);
      setOverallProgress(0);
      toast.info("Batch processing cancelled");
      return;
    }
    
    if (currentFileIndex < files.length - 1) {
      // Process next file after a short delay
      setTimeout(() => {
        setCurrentFileIndex(prev => prev + 1);
        setProcessingError(null);
      }, 500);
    } else {
      // All files processed
      setIsProcessing(false);
      setProcessingError(null);
      
      // Display appropriate completion message based on success/failure count
      if (failedFiles.length === 0) {
        toast.success(`Successfully processed all ${files.length} documents`);
      } else {
        toast.success(
          `Completed processing ${files.length} documents. ` +
          `${files.length - failedFiles.length} succeeded, ` +
          `${failedFiles.length} failed.`
        );
      }
      
      // Complete the progress indicator
      setOverallProgress(100);
    }
  }, [currentFileIndex, files.length, failedFiles.length]);
  
  // File selection handlers
  const handleFilesSelect = useCallback((selectedFiles: File[]) => {
    setFiles(prev => [...prev, ...selectedFiles]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Update extraction strategy in document processing hook when local state changes
  useEffect(() => {
    setDocProcessingExtractionStrategy(extractionStrategy);
  }, [extractionStrategy, setDocProcessingExtractionStrategy]);

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

  // Start processing all documents
  const handleProcessAllDocuments = useCallback(() => {
    if (!files.length || !selectedProject) return;
    
    setIsProcessing(true);
    setCurrentFileIndex(0);
    setOverallProgress(0);
    setProcessingError(null);
    setFailedFiles([]);
    processingCancelled.current = false;
    
    // The useEffect watching currentFileIndex will trigger the first document process
  }, [files.length, selectedProject]);

  // Cancel ongoing processing
  const handleCancelProcessing = useCallback(() => {
    processingCancelled.current = true;
    toast.info("Cancelling after current file completes...");
  }, []);

  // Calculate overall progress based on current file index and current file progress
  const calculateOverallProgress = useCallback(() => {
    if (files.length === 0) return 0;
    
    const fileContribution = 100 / files.length;
    return Math.floor(currentFileIndex * fileContribution + (fileProgress * fileContribution / 100));
  }, [currentFileIndex, fileProgress, files.length]);

  // Update overall progress whenever file progress or current index changes
  useEffect(() => {
    if (isProcessing) {
      setOverallProgress(calculateOverallProgress());
    }
  }, [isProcessing, calculateOverallProgress]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Batch Upload</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload Multiple Documents</CardTitle>
          <CardDescription>
            Process multiple documents at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <ProjectSelector
              selectedProject={selectedProject}
              onChange={setSelectedProject}
              disabled={isProcessing}
            />
            
            <MultiFileUploadArea
              supportedTypes={supportedTypes}
              files={files}
              onFilesSelect={handleFilesSelect}
              onRemoveFile={handleRemoveFile}
              onError={(err) => toast.error(err)}
              isDisabled={isProcessing}
              maxFiles={MAX_BATCH_FILES}
            />

            {files.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">File count:</span>
                <Badge variant="outline" className="ml-auto">
                  {files.length} of {MAX_BATCH_FILES} maximum
                </Badge>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModelSelector
                value={modelSelection}
                onChange={setModelSelection}
                disabled={isProcessing || files.length === 0}
              />
              
              <LanguageSelector
                value={ocrLanguage}
                onChange={setOcrLanguage}
                disabled={isProcessing || files.length === 0}
              />
            </div>
            
            <ExtractionStrategySelector
              value={extractionStrategy}
              onChange={setExtractionStrategy}
              disabled={isProcessing || files.length === 0}
            />
            
            <div className="flex gap-2">
              {!isProcessing ? (
                <Button
                  className="flex-1"
                  onClick={handleProcessAllDocuments}
                  disabled={isProcessing || files.length === 0 || !selectedProject}
                >
                  <CheckCircle2 className="mr-1" />
                  {`Process ${files.length} Document${files.length !== 1 ? 's' : ''}`}
                </Button>
              ) : (
                <>
                  <Button 
                    className="flex-1" 
                    disabled 
                    variant="outline"
                  >
                    <Loader className="mr-2 h-4 w-4 animate-spin" /> 
                    Processing {currentFileIndex + 1} of {files.length}
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelProcessing}
                  >
                    <Ban className="mr-1" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
            
            {isProcessing && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      Current File: {files[currentFileIndex]?.name || ""}
                    </span>
                    <span>{fileProgress}%</span>
                  </div>
                  <ProcessingIndicator
                    isProcessing={isProcessing}
                    progress={fileProgress}
                    statusMessage={statusMessage}
                    ocrLanguage={ocrLanguage}
                    error={processingError}
                    warnings={failedFiles.map(f => `Failed: ${f.name}`)}
                  />
                </div>
              </div>
            )}
            
            {!isProcessing && failedFiles.length > 0 && (
              <div className="mt-4">
                <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
                  <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                  <AlertDescription>
                    {`${failedFiles.length} file${failedFiles.length > 1 ? 's' : ''} failed processing`}
                  </AlertDescription>
                </Alert>
                <div className="mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
                  <ul className="space-y-1">
                    {failedFiles.map((file, idx) => (
                      <li key={idx} className="text-sm flex">
                        <X className="h-4 w-4 text-red-500 mr-1 flex-shrink-0" />
                        <span className="font-medium">{file.name}:</span>
                        <span className="ml-1 text-gray-600 truncate">{file.error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchUpload;
