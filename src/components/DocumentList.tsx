
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Document } from "@/types/document";
import DocumentViewer from "./DocumentViewer";
import DocumentsTable from "./documents/DocumentsTable";
import DeleteConfirmDialog from "./documents/DeleteConfirmDialog";
import { useDocuments } from "@/hooks/useDocuments";

interface DocumentListProps {
  refreshTrigger: number;
  limit?: number;
}

const DocumentList = ({ refreshTrigger, limit }: DocumentListProps) => {
  const { documents, loading, isDeleting, deleteDocument } = useDocuments(refreshTrigger, limit);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setViewerOpen(true);
  };

  const handleDeleteClick = (document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;
    
    const success = await deleteDocument(
      documentToDelete.id, 
      documentToDelete.storage_path, 
      documentToDelete.filename
    );
    
    if (success) {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <p>Loading documents...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No documents processed yet</p>
      </div>
    );
  }

  return (
    <>
      <DocumentsTable 
        documents={documents}
        onViewDocument={handleViewDocument}
        onDeleteClick={handleDeleteClick}
      />

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-4xl h-[80vh] p-0">
          {selectedDocument && (
            <DocumentViewer document={selectedDocument} />
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        document={documentToDelete}
        isOpen={deleteDialogOpen}
        isDeleting={isDeleting}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default DocumentList;
