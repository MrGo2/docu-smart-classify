
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/types/document";
import { toast } from "sonner";

export const useDocuments = (
  refreshTrigger: number, 
  limit?: number, 
  page: number = 1,
  projectId?: string
) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        // Build the base query
        let countQuery = supabase
          .from("documents")
          .select("*", { count: 'exact', head: true });
          
        let dataQuery = supabase
          .from("documents")
          .select("*")
          .order("created_at", { ascending: false });
        
        // Apply project filter if provided
        if (projectId) {
          countQuery = countQuery.eq("project_id", projectId);
          dataQuery = dataQuery.eq("project_id", projectId);
        }
        
        // First get the total count for pagination
        const { count, error: countError } = await countQuery;
          
        if (countError) throw countError;
        
        const total = count || 0;
        setTotalCount(total);
        
        // Calculate total pages
        const pages = limit ? Math.ceil(total / limit) : 1;
        setTotalPages(pages);
        
        // Then fetch the actual data with pagination
        const startIndex = limit ? (page - 1) * limit : 0;
        
        if (limit) {
          dataQuery = dataQuery.range(startIndex, startIndex + limit - 1);
        }

        const { data, error } = await dataQuery;

        if (error) throw error;
        setDocuments(data || []);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [refreshTrigger, limit, page, projectId]);

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
    deleteDocument,
    totalCount,
    totalPages,
    currentPage: page
  };
};
