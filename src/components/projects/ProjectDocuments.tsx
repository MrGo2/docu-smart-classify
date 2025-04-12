
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDocuments } from "@/hooks/useDocuments";
import DocumentsTable from "@/components/documents/DocumentsTable";
import DocumentViewer from "@/components/DocumentViewer";
import DeleteConfirmDialog from "@/components/documents/DeleteConfirmDialog";
import { Document } from "@/types/document";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProjectDocumentsProps {
  projectId: string;
}

const ProjectDocuments = ({ projectId }: ProjectDocumentsProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const limit = 10;
  
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
      setRefreshTrigger(prev => prev + 1);
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
    setRefreshTrigger(prev => prev + 1);
    
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

  return (
    <>
      {loading ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">Loading documents...</p>
          </CardContent>
        </Card>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No documents in this project</p>
          </CardContent>
        </Card>
      ) : (
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
      )}

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

export default ProjectDocuments;
