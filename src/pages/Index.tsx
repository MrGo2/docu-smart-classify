import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DocumentUploader from "@/components/DocumentUploader";
import ApiKeyManager from "@/components/ApiKeyManager";
import DocumentList from "@/components/DocumentList";
import { toast } from "sonner";

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDocumentProcessed = () => {
    toast.success("Document processed successfully");
    setRefreshTrigger(prev => prev + 1);
    setIsProcessing(false);
  };

  const handleProcessingStart = () => {
    setIsProcessing(true);
  };

  const handleProcessingError = (error: string) => {
    toast.error(`Error processing document: ${error}`);
    setIsProcessing(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold text-center">DocuAnalyzer</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>API Key Management</CardTitle>
            <CardDescription>
              Configure your AI model API keys
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApiKeyManager />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
            <CardDescription>
              Upload a document for processing (PDF, JPG, PNG, or Office document)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUploader 
              onProcessingStart={handleProcessingStart}
              onProcessingComplete={handleDocumentProcessed}
              onProcessingError={handleProcessingError}
              isProcessing={isProcessing}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Document Library</CardTitle>
            <CardDescription>
              View and manage your processed documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentList refreshTrigger={refreshTrigger} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
