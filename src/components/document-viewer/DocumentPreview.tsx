
import React from "react";
import { Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentPreviewProps {
  fileUrl: string | null;
  fileType: string;
  filename: string;
  loading: boolean;
  error: string | null;
  onDownload: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  fileUrl,
  fileType,
  filename,
  loading,
  error,
  onDownload,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>Loading document preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-destructive">
        <p>{error}</p>
        <Button variant="outline" onClick={onDownload}>
          Try Download Instead
        </Button>
      </div>
    );
  }

  if (!fileUrl) return null;

  if (fileType.includes("pdf")) {
    return (
      <iframe
        src={`${fileUrl}#toolbar=0`}
        className="w-full h-full border-0"
        title={filename}
      />
    );
  } else if (fileType.includes("image")) {
    return (
      <div className="flex items-center justify-center h-full">
        <img
          src={fileUrl}
          alt={filename}
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
          Preview not available for {fileType.split("/")[1]} files
        </p>
        <Button className="mt-4" onClick={onDownload}>
          Download to view
        </Button>
      </div>
    );
  }
};

export default DocumentPreview;
