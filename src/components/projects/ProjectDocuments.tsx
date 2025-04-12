
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDocuments } from "@/hooks/useDocuments";
import DocumentsTable from "@/components/documents/DocumentsTable";
import DocumentViewer from "@/components/DocumentViewer";
import DeleteConfirmDialog from "@/components/documents/DeleteConfirmDialog";
import { Document } from "@/types/document";

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
    </>
  );
};

export default ProjectDocuments;
