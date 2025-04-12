
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseDocumentUrlOptions {
  bucketName?: string;
  expirySeconds?: number;
}

export const useDocumentUrl = (
  storagePath: string | null,
  options: UseDocumentUrlOptions = {}
) => {
  const { bucketName = "documents", expirySeconds = 60 * 60 } = options;
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSignedUrl = async () => {
    if (!storagePath) {
      setError("No storage path provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get a signed URL for the document
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(storagePath, expirySeconds);

      if (error) {
        throw error;
      }
      
      setFileUrl(data.signedUrl);
    } catch (err) {
      console.error("Error loading document URL:", err);
      setError(
        err instanceof Error 
          ? `Failed to load document: ${err.message}` 
          : "Failed to load document"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignedUrl();
  }, [storagePath, bucketName, expirySeconds]);

  return {
    fileUrl,
    loading,
    error,
    refresh: loadSignedUrl,
  };
};
