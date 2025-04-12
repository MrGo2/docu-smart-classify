
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Document } from "@/types/document";
import DocumentViewer from "./DocumentViewer";
import DocumentsTable from "./documents/DocumentsTable";
import DeleteConfirmDialog from "./documents/DeleteConfirmDialog";
import { useDocuments } from "@/hooks/useDocuments";
import { toast } from "sonner";

interface DocumentListProps {
  refreshTrigger: number;
  limit?: number;
  projectId?: string;
}

const DocumentList = ({ refreshTrigger, limit = 10, projectId }: DocumentListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { 
    documents, 
    loading, 
    isDeleting, 
    deleteDocument, 
    totalPages, 
    totalCount 
  } = useDocuments(refreshTrigger, limit, currentPage, projectId);
  
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [documentsToDelete, setDocumentsToDelete] = useState<string[]>([]);
  const [multiDeleteDialogOpen, setMultiDeleteDialogOpen] = useState(false);

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

  const handleMultiDeleteClick = (documentIds: string[]) => {
    setDocumentsToDelete(documentIds);
    setMultiDeleteDialogOpen(true);
  };

  const handleMultiDeleteConfirm = async () => {
    if (!documentsToDelete.length) return;
    
    let successCount = 0;
    let failCount = 0;
    
    // Find the documents to delete
    const docsToDelete = documents.filter(doc => documentsToDelete.includes(doc.id));
    
    for (const doc of docsToDelete) {
      const success = await deleteDocument(doc.id, doc.storage_path, doc.filename);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }
    
    setMultiDeleteDialogOpen(false);
    setDocumentsToDelete([]);
    
    if (successCount > 0) {
      toast.success(`Successfully deleted ${successCount} document${successCount !== 1 ? 's' : ''}`);
    }
    
    if (failCount > 0) {
      toast.error(`Failed to delete ${failCount} document${failCount !== 1 ? 's' : ''}`);
    }
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <p>Loading documents...</p>
      </div>
    );
  }

  if (documents.length === 0 && currentPage === 1) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No documents processed yet</p>
      </div>
    );
  }
  
  // If we're on a page with no documents (e.g., after deletion), go back to page 1
  if (documents.length === 0 && currentPage !== 1) {
    setCurrentPage(1);
    return null;
  }

  return (
    <>
      <DocumentsTable 
        documents={documents}
        onViewDocument={handleViewDocument}
        onDeleteClick={handleDeleteClick}
        onDeleteMultiple={handleMultiDeleteClick}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalCount={totalCount}
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

      {/* Multi-delete confirmation dialog */}
      <Dialog open={multiDeleteDialogOpen} onOpenChange={setMultiDeleteDialogOpen}>
        <DialogContent>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Confirm Multiple Deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete {documentsToDelete.length} selected document{documentsToDelete.length !== 1 ? 's' : ''}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setMultiDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={isDeleting}
                onClick={handleMultiDeleteConfirm}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>Delete {documentsToDelete.length} document{documentsToDelete.length !== 1 ? 's' : ''}</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentList;
