
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useDocumentProcessing } from "@/hooks/useDocumentProcessing";
import { useBatchProcessor } from "@/hooks/useBatchProcessor";
import MultiFileUploadArea from "@/components/upload/MultiFileUploadArea";
import ModelSelector from "@/components/upload/ModelSelector";
import LanguageSelector from "@/components/upload/LanguageSelector";
import ProjectSelector from "@/components/projects/ProjectSelector";
import ExtractionStrategySelector from "@/components/upload/ExtractionStrategySelector";
import { Badge } from "@/components/ui/badge";
import { ExtractionStrategy } from "@/lib/extraction/types";
import BatchProcessingControls from "@/components/upload/BatchProcessingControls";
import BatchProgressDisplay from "@/components/upload/BatchProgressDisplay";
import FailedFilesDisplay from "@/components/upload/FailedFilesDisplay";

// Constants
const MAX_BATCH_FILES = 20;

const BatchUpload = () => {
  // Set up document processing hook
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
    setExtractionStrategy,
    processDocument,
  } = useDocumentProcessing(
    () => {}, // onProcessingStart
    () => {
      // When current file completes successfully
      const result = batchProcessor.onFileProcessed();
      if (result === "complete") {
        if (batchProcessor.failedFiles.length === 0) {
          toast.success(`Successfully processed all ${batchProcessor.files.length} documents`);
        } else {
          toast.success(
            `Completed processing ${batchProcessor.files.length} documents. ` +
            `${batchProcessor.files.length - batchProcessor.failedFiles.length} succeeded, ` +
            `${batchProcessor.failedFiles.length} failed.`
          );
        }
      } else if (result === "cancelled") {
        toast.info("Batch processing cancelled");
      }
    },
    (error) => {
      // When current file encounters an error
      const result = batchProcessor.onFileError(error);
      if (result === "complete") {
        toast.success(
          `Completed processing ${batchProcessor.files.length} documents with ${batchProcessor.failedFiles.length} errors.`
        );
      } else if (result === "cancelled") {
        toast.info("Batch processing cancelled");
      }
    }
  );

  const [extractionStrategy, setExtractionStrategyState] = useState<ExtractionStrategy>(ExtractionStrategy.FIRST_PAGE);

  // Set up batch processor hook
  const batchProcessor = useBatchProcessor({
    processDocument,
    fileProgress,
    statusMessage,
    ocrLanguage,
  });

  // Update extraction strategy in document processing hook when local state changes
  const handleExtractionStrategyChange = useCallback((strategy: ExtractionStrategy) => {
    setExtractionStrategyState(strategy);
    setExtractionStrategy(strategy);
  }, [setExtractionStrategy]);

  // Handle starting the batch process
  const handleProcessAllDocuments = useCallback(() => {
    if (!batchProcessor.files.length || !selectedProject) return;
    batchProcessor.startBatchProcessing();
  }, [batchProcessor, selectedProject]);

  // Handle canceling the batch process
  const handleCancelProcessing = useCallback(() => {
    const message = batchProcessor.cancelBatchProcessing();
    toast.info(message);
  }, [batchProcessor]);

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
              disabled={batchProcessor.isProcessing}
            />
            
            <MultiFileUploadArea
              supportedTypes={supportedTypes}
              files={batchProcessor.files}
              onFilesSelect={batchProcessor.handleFilesSelect}
              onRemoveFile={batchProcessor.handleRemoveFile}
              onError={(err) => toast.error(err)}
              isDisabled={batchProcessor.isProcessing}
              maxFiles={MAX_BATCH_FILES}
            />

            {batchProcessor.files.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">File count:</span>
                <Badge variant="outline" className="ml-auto">
                  {batchProcessor.files.length} of {MAX_BATCH_FILES} maximum
                </Badge>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModelSelector
                value={modelSelection}
                onChange={setModelSelection}
                disabled={batchProcessor.isProcessing || batchProcessor.files.length === 0}
              />
              
              <LanguageSelector
                value={ocrLanguage}
                onChange={setOcrLanguage}
                disabled={batchProcessor.isProcessing || batchProcessor.files.length === 0}
              />
            </div>
            
            <ExtractionStrategySelector
              value={extractionStrategy}
              onChange={handleExtractionStrategyChange}
              disabled={batchProcessor.isProcessing || batchProcessor.files.length === 0}
            />
            
            <div className="flex gap-2">
              <BatchProcessingControls 
                isProcessing={batchProcessor.isProcessing}
                fileCount={batchProcessor.files.length}
                onStartProcessing={handleProcessAllDocuments}
                onCancelProcessing={handleCancelProcessing}
                disabled={!selectedProject}
              />
            </div>
            
            {/* Progress Display */}
            <BatchProgressDisplay 
              isProcessing={batchProcessor.isProcessing}
              overallProgress={batchProcessor.overallProgress}
              currentFileName={batchProcessor.files[batchProcessor.currentFileIndex]?.name || ""}
              fileProgress={fileProgress}
              statusMessage={statusMessage}
              ocrLanguage={ocrLanguage}
              processingError={batchProcessor.processingError}
              failedFiles={batchProcessor.failedFiles}
            />
            
            {/* Failed Files Display */}
            {!batchProcessor.isProcessing && (
              <FailedFilesDisplay 
                failedFiles={batchProcessor.failedFiles}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchUpload;
