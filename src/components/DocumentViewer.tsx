
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDocumentUrl } from "@/hooks/useDocumentUrl";
import DocumentPreview from "@/components/document-viewer/DocumentPreview";
import DocumentMetadata from "@/components/document-viewer/DocumentMetadata";
import DownloadButton from "@/components/document-viewer/DownloadButton";
import { Document } from "@/types/document";

interface DocumentViewerProps {
  document: Document;
}

const DocumentViewer = ({ document }: DocumentViewerProps) => {
  const { fileUrl, loading, error, refresh } = useDocumentUrl(document.storage_path);

  return (
    <div className="flex flex-col h-full">
      <DialogHeader className="p-6 pb-0">
        <DialogTitle className="text-xl flex items-center justify-between">
          <span>{document.filename}</span>
          <DownloadButton
            size="sm"
            variant="outline"
            fileUrl={fileUrl}
            filename={document.filename}
            className="ml-4"
          >
            Download
          </DownloadButton>
        </DialogTitle>
      </DialogHeader>

      <Tabs defaultValue="preview" className="flex flex-col h-full">
        <div className="px-6">
          <TabsList>
            <TabsTrigger value="preview">Document Preview</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            {document.extracted_text && (
              <TabsTrigger value="text">Extracted Text</TabsTrigger>
            )}
            {document.classification_text && (
              <TabsTrigger value="classification_text">Classification Text</TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="preview" className="flex-grow p-6 pt-2">
          <DocumentPreview
            fileUrl={fileUrl}
            fileType={document.file_type}
            filename={document.filename}
            loading={loading}
            error={error}
            onDownload={() => refresh()}
          />
        </TabsContent>

        <TabsContent value="metadata" className="p-6">
          <DocumentMetadata
            filename={document.filename}
            fileType={document.file_type}
            classification={document.classification}
            extractionStrategy={document.extraction_strategy}
            metadata={document.metadata}
          />
        </TabsContent>

        {document.extracted_text && (
          <TabsContent value="text" className="p-6">
            <div className="border rounded-md p-4 bg-gray-50 overflow-auto max-h-[60vh]">
              <pre className="text-sm whitespace-pre-wrap">{document.extracted_text}</pre>
            </div>
          </TabsContent>
        )}

        {document.classification_text && (
          <TabsContent value="classification_text" className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Text used for classification</h3>
              <p className="text-xs text-muted-foreground mb-4">
                This is the subset of text that was sent to the AI for document classification.
              </p>
            </div>
            <div className="border rounded-md p-4 bg-gray-50 overflow-auto max-h-[60vh]">
              <pre className="text-sm whitespace-pre-wrap">{document.classification_text}</pre>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default DocumentViewer;
