
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const BatchUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  
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
    processDocument,
  } = useDocumentProcessing(
    () => {},
    () => {
      // When current file completes
      if (currentFileIndex < files.length - 1) {
        // Process next file
        setCurrentFileIndex(prev => prev + 1);
      } else {
        // All files processed
        setIsProcessing(false);
        toast.success(`All ${files.length} documents processed successfully`);
        setFiles([]);
        setCurrentFileIndex(0);
      }
    },
    (error) => {
      toast.error(`Error processing document: ${error}`);
      // Continue with next file despite error
      if (currentFileIndex < files.length - 1) {
        setCurrentFileIndex(prev => prev + 1);
      } else {
        setIsProcessing(false);
        setFiles([]);
        setCurrentFileIndex(0);
      }
    }
  );

  const handleFilesSelect = (selectedFiles: File[]) => {
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcessAllDocuments = async () => {
    if (!files.length || !selectedProject) return;
    
    setIsProcessing(true);
    setCurrentFileIndex(0);
    setOverallProgress(0);
    
    // Process first file, the completion callback will handle the next ones
    await processDocument(files[0]);
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
                    statusMessage={statusMessage}
                    ocrLanguage={ocrLanguage}
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
