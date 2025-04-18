
import { useState } from "react";
import { Document } from "@/types/document";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UseDocumentDeletionProps {
  documents: Document[];
  onDeleteSuccess: () => void;
  limit: number;
}

export const useDocumentDeletion = ({ documents, onDeleteSuccess, limit }: UseDocumentDeletionProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [documentsToDelete, setDocumentsToDelete] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [multiDeleteDialogOpen, setMultiDeleteDialogOpen] = useState(false);
  const [doubleConfirmOpen, setDoubleConfirmOpen] = useState(false);
  const [isAllAcrossPagesSelected, setIsAllAcrossPagesSelected] = useState(false);

  const deleteDocument = async (documentId: string, storagePath: string, filename: string) => {
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
      
      toast.success(`"${filename}" deleted successfully`);
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const handleDeleteClick = (document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;
    
    setIsDeleting(true);
    const success = await deleteDocument(
      documentToDelete.id, 
      documentToDelete.storage_path, 
      documentToDelete.filename
    );
    
    if (success) {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      onDeleteSuccess();
    }
    setIsDeleting(false);
  };

  const handleMultiDeleteClick = (documentIds: string[]) => {
    setDocumentsToDelete(documentIds);
    setMultiDeleteDialogOpen(true);
  };

  const handleFirstConfirm = () => {
    setMultiDeleteDialogOpen(false);
    setDoubleConfirmOpen(true);
  };

  const handleMultiDeleteConfirm = async () => {
    if (!documentsToDelete.length) return;
    
    setIsDeleting(true);
    let successCount = 0;
    let failCount = 0;
    
    if (documentsToDelete[0] === '*') {
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const { data: docsToDelete } = await supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false })
          .range((page - 1) * limit, page * limit - 1);
        
        if (!docsToDelete || docsToDelete.length === 0) {
          hasMore = false;
          continue;
        }

        for (const doc of docsToDelete) {
          const success = await deleteDocument(doc.id, doc.storage_path, doc.filename);
          if (success) {
            successCount++;
          } else {
            failCount++;
          }
        }

        page++;
      }
    } else {
      const docsToDelete = documents.filter(doc => documentsToDelete.includes(doc.id));
      for (const doc of docsToDelete) {
        const success = await deleteDocument(doc.id, doc.storage_path, doc.filename);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
      }
    }
    
    setIsDeleting(false);
    setDoubleConfirmOpen(false);
    setMultiDeleteDialogOpen(false);
    setDocumentsToDelete([]);
    setIsAllAcrossPagesSelected(false);
    
    if (successCount > 0) {
      toast.success(`Successfully deleted ${successCount} document${successCount !== 1 ? 's' : ''}`);
    }
    
    if (failCount > 0) {
      toast.error(`Failed to delete ${failCount} document${failCount !== 1 ? 's' : ''}`);
    }

    onDeleteSuccess();
  };

  return {
    isDeleting,
    documentToDelete,
    documentsToDelete,
    deleteDialogOpen,
    multiDeleteDialogOpen,
    doubleConfirmOpen,
    isAllAcrossPagesSelected,
    setDeleteDialogOpen,
    setIsAllAcrossPagesSelected,
    handleDeleteClick,
    handleDeleteConfirm,
    handleMultiDeleteClick,
    handleFirstConfirm,
    handleMultiDeleteConfirm
  };
};
