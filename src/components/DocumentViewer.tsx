
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Download, FileText } from "lucide-react";

interface Document {
  id: string;
  filename: string;
  file_type: string;
  storage_path: string;
  classification: string | null;
  extracted_text: string | null;
}

interface DocumentViewerProps {
  document: Document;
}

const DocumentViewer = ({ document }: DocumentViewerProps) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true);

        // Get a signed URL for the document
        const { data, error } = await supabase.storage
          .from("documents")
          .createSignedUrl(document.storage_path, 60 * 60); // 1 hour expiry

        if (error) throw error;
        
        setFileUrl(data.signedUrl);
      } catch (err) {
        console.error("Error loading document:", err);
        setError("Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [document]);

  const handleDownload = async () => {
    if (!fileUrl) return;
    
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = document.filename;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      
      // Clean up the object URL
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  // Render document preview based on file type
  const renderDocumentPreview = () => {
    if (!fileUrl) return null;

    if (document.file_type.includes("pdf")) {
      return (
        <iframe
          src={`${fileUrl}#toolbar=0`}
          className="w-full h-full border-0"
          title={document.filename}
        />
      );
    } else if (document.file_type.includes("image")) {
      return (
        <div className="flex items-center justify-center h-full">
          <img
            src={fileUrl}
            alt={document.filename}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      );
    } else {
      // For unsupported preview types
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <FileText className="w-16 h-16 text-gray-300 mb-4" />
          <p>
            Preview not available for {document.file_type.split("/")[1]} files
          </p>
          <Button className="mt-4" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download to view
          </Button>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <DialogHeader className="p-6 pb-0">
        <DialogTitle className="text-xl flex items-center justify-between">
          <span>{document.filename}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="ml-4"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
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
          </TabsList>
        </div>

        <TabsContent value="preview" className="flex-grow p-6 pt-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <p>Loading document preview...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-destructive">
              {error}
            </div>
          ) : (
            renderDocumentPreview()
          )}
        </TabsContent>

        <TabsContent value="metadata" className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Filename</p>
                <p>{document.filename}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">File Type</p>
                <p>{document.file_type}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Classification</p>
                <p>{document.classification || "Unclassified"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Storage Path</p>
                <p className="truncate">{document.storage_path}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {document.extracted_text && (
          <TabsContent value="text" className="p-6">
            <div className="border rounded-md p-4 bg-gray-50 overflow-auto max-h-[60vh]">
              <pre className="text-sm whitespace-pre-wrap">{document.extracted_text}</pre>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default DocumentViewer;
