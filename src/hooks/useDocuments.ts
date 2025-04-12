
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/types/document";
import { toast } from "sonner";

export const useDocuments = (refreshTrigger: number, limit?: number) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("documents")
          .select("*")
          .order("created_at", { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        setDocuments(data || []);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [refreshTrigger, limit]);

  const deleteDocument = async (documentId: string, storagePath: string, filename: string) => {
    setIsDeleting(true);
    try {
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([storagePath]);
        
      if (storageError) throw storageError;
      
      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId);
        
      if (dbError) throw dbError;
      
      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast.success(`"${filename}" deleted successfully`);
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    documents,
    loading,
    isDeleting,
    deleteDocument
  };
};
