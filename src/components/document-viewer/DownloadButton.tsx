
import React, { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DownloadButtonProps extends ButtonProps {
  fileUrl: string | null;
  filename: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  fileUrl,
  filename,
  children,
  ...props
}) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!fileUrl) {
      toast.error("Download URL is not available");
      return;
    }
    
    try {
      setDownloading(true);
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      
      // Clean up the object URL
      URL.revokeObjectURL(downloadUrl);
      toast.success(`Started downloading ${filename}`);
    } catch (err) {
      console.error("Download error:", err);
      toast.error(`Failed to download: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={!fileUrl || downloading}
      {...props}
    >
      {downloading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {children || "Download"}
    </Button>
  );
};

export default DownloadButton;
