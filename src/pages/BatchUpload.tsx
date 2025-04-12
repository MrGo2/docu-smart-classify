
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader } from "lucide-react";
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

const BatchUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [extractionStrategy, setExtractionStrategy] = useState<ExtractionStrategy>(ExtractionStrategy.FIRST_PAGE);
  const [processingError, setProcessingError] = useState<string | null>(null);
  
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
      // When current file completes
      handleFileComplete(true);
    },
    (error) => {
      // Log the error but continue processing
      setProcessingError(error);
      toast.error(`Error processing "${files[currentFileIndex]?.name}": ${error}`);
      
      // Continue with next file despite error
      handleFileComplete(false);
    }
  );

  const handleFileComplete = (success: boolean) => {
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
      toast.success(`Completed processing ${files.length} documents. ${
        success ? '' : 'Some files may have encountered errors.'
      }`);
      setFiles([]);
      setCurrentFileIndex(0);
      setOverallProgress(100);
    }
  };

  const handleFilesSelect = (selectedFiles: File[]) => {
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Update the extraction strategy in the document processing hook when it changes in this component
  useEffect(() => {
    setDocProcessingExtractionStrategy(extractionStrategy);
  }, [extractionStrategy, setDocProcessingExtractionStrategy]);

  // Process the next file in the queue
  useEffect(() => {
    if (isProcessing && files[currentFileIndex]) {
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
  }, [currentFileIndex, isProcessing]);

  const handleProcessAllDocuments = async () => {
    if (!files.length || !selectedProject) return;
    
    setIsProcessing(true);
    setCurrentFileIndex(0);
    setOverallProgress(0);
    setProcessingError(null);
    
    // The useEffect will handle starting the first document processing
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (files.length === 0) return 0;
    
    const fileContribution = 100 / files.length;
    return Math.min(
      Math.floor(currentFileIndex * fileContribution + (fileProgress * fileContribution / 100)),
      99
    );
  };

  // Update overall progress whenever file progress or current index changes
  useEffect(() => {
    if (isProcessing) {
      setOverallProgress(calculateOverallProgress());
    }
  }, [isProcessing, fileProgress, currentFileIndex, files.length]);

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
              maxFiles={20}
            />

            {files.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">File count:</span>
                <Badge variant="outline" className="ml-auto">
                  {files.length} of 20 maximum
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
            
            <Button
              className="w-full"
              onClick={handleProcessAllDocuments}
              disabled={isProcessing || files.length === 0 || !selectedProject}
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> 
                  Processing {currentFileIndex + 1} of {files.length}
                </span>
              ) : (
                `Process ${files.length} Document${files.length !== 1 ? 's' : ''}`
              )}
            </Button>
            
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
                    statusMessage={processingError || statusMessage}
                    ocrLanguage={ocrLanguage}
                    error={processingError}
                  />
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
