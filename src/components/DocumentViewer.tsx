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

// Function to format text into clean markdown
const formatToMarkdown = (text: string): string => {
  if (!text) return '';
  
  // Split into paragraphs
  const paragraphs = text.split(/\n{2,}/);
  
  // Process each paragraph
  return paragraphs.map(paragraph => {
    // Handle page breaks
    if (paragraph.trim() === '=== PAGE BREAK ===') {
      return '\n---\n'; // Markdown horizontal rule for page breaks
    }
    
    // Clean up extra whitespace
    return paragraph
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n/g, ' '); // Replace single newlines with spaces
  }).join('\n\n'); // Join paragraphs with double newlines
};

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
            <div className="border rounded-md bg-white overflow-auto max-h-[60vh]">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="text-sm font-medium">Extracted Text</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Full text extracted from the document using OCR or direct text extraction.
                </p>
              </div>
              <div className="p-4 prose prose-sm max-w-none">
                {formatToMarkdown(document.extracted_text).split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line.trim() === '---' ? (
                      <div className="my-4 text-gray-400 text-center text-sm border-t pt-2">
                        --- Page Break ---
                      </div>
                    ) : (
                      <p className="mb-4 last:mb-0">{line}</p>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </TabsContent>
        )}

        {document.classification_text && (
          <TabsContent value="classification_text" className="p-6">
            <div className="border rounded-md bg-white overflow-auto max-h-[60vh]">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="text-sm font-medium">Classification Text</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  This is the subset of text that was sent to the AI for document classification.
                </p>
              </div>
              <div className="p-4 prose prose-sm max-w-none">
                {formatToMarkdown(document.classification_text).split('\n').map((line, index) => (
                  <p key={index} className="mb-4 last:mb-0">{line}</p>
                ))}
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default DocumentViewer;
