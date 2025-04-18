
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MultiFileUploadArea from "@/components/upload/MultiFileUploadArea";
import { useDocumentProcessing } from "@/hooks/useDocumentProcessing";
import { toast } from "sonner";
import ProjectSelector from "@/components/projects/ProjectSelector";
import ModelSelector from "@/components/upload/ModelSelector";
import LanguageSelector from "@/components/upload/LanguageSelector";
import ExtractionStrategySelector from "@/components/upload/ExtractionStrategySelector";
import { useBatchProcessor } from "@/hooks/useBatchProcessor";
import BatchProcessingControls from "@/components/upload/BatchProcessingControls";
import BatchProgressDisplay from "@/components/upload/BatchProgressDisplay";
import FailedFilesDisplay from "@/components/upload/FailedFilesDisplay";
import { useNavigate } from "react-router-dom";

const BatchUpload = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const {
    modelSelection,
    ocrLanguage,
    extractionStrategy,
    fileProgress,
    statusMessage,
    supportedTypes,
    selectedProject,
    setModelSelection,
    setOcrLanguage,
    setExtractionStrategy,
    setSelectedProject,
    processDocument,
  } = useDocumentProcessing(
    // On processing start
    () => {},
    // On processing complete
    () => {
      // Navigate to the documents page when batch is complete
      toast.success("All documents processed successfully!");
      navigate("/documents");
    },
    // On processing error
    (error) => toast.error(error)
  );

  const {
    files,
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
  } = useBatchProcessor({
    processDocument,
    fileProgress,
    statusMessage,
    ocrLanguage,
  });

  const handleProcessStart = () => {
    setIsProcessing(true);
    startBatchProcessing();
  };

  const handleProcessCancel = () => {
    toast.info(cancelBatchProcessing());
  };

  const handleProcessingComplete = () => {
    setIsProcessing(false);
    navigate("/documents"); // Ensure navigation after completion
    toast.success("Batch processing complete");
  };

  // Get current file name for display
  const currentFileName = files[currentFileIndex]?.name || "";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Batch Document Upload</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload Multiple Documents</CardTitle>
          <CardDescription>
            Upload and process multiple documents in a batch
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            isDisabled={isProcessing}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModelSelector
              value={modelSelection}
              onChange={setModelSelection}
              disabled={isProcessing}
            />
            
            <LanguageSelector
              value={ocrLanguage}
              onChange={setOcrLanguage}
              disabled={isProcessing}
            />
          </div>
          
          <ExtractionStrategySelector
            value={extractionStrategy}
            onChange={setExtractionStrategy}
            disabled={isProcessing}
          />
          
          <div className="flex flex-col md:flex-row gap-2">
            <BatchProcessingControls
              isProcessing={isProcessing}
              fileCount={files.length}
              onStartProcessing={handleProcessStart}
              onCancelProcessing={handleProcessCancel}
              disabled={!selectedProject}
            />
          </div>
          
          <BatchProgressDisplay
            isProcessing={isProcessing}
            overallProgress={overallProgress}
            currentFileName={currentFileName}
            fileProgress={fileProgress}
            statusMessage={statusMessage}
            ocrLanguage={ocrLanguage}
            processingError={processingError}
            failedFiles={failedFiles}
          />
          
          <FailedFilesDisplay failedFiles={failedFiles} />
        </CardContent>
      </Card>

      {/* View processed documents button */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={() => navigate("/documents")}
        >
          View All Documents
        </Button>
      </div>
    </div>
  );
};

export default BatchUpload;
