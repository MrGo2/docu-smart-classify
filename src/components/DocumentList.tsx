
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Document } from "@/types/document";
import DocumentViewer from "./DocumentViewer";
import DocumentsTable from "./documents/DocumentsTable";
import DeleteConfirmDialog from "./documents/DeleteConfirmDialog";
import DeleteMultipleDialog from "./documents/DeleteMultipleDialog";
import DocumentsLoading from "./documents/DocumentsLoading";
import { useDocuments } from "@/hooks/useDocuments";
import { useDocumentDeletion } from "@/hooks/useDocumentDeletion";

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
    totalPages, 
    totalCount 
  } = useDocuments(refreshTrigger, limit, currentPage, projectId);

  const {
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
  } = useDocumentDeletion({
    documents,
    onDeleteSuccess: () => setCurrentPage(1),
    limit
  });
  
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [refreshTrigger]);

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setViewerOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <DocumentsLoading />;
  }

  if (documents.length === 0 && currentPage === 1) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No documents processed yet</p>
      </div>
    );
  }

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
        onSelectAllAcrossPages={() => setIsAllAcrossPagesSelected(!isAllAcrossPagesSelected)}
        isAllAcrossPagesSelected={isAllAcrossPagesSelected}
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

      <DeleteMultipleDialog
        isOpen={multiDeleteDialogOpen}
        onOpenChange={setMultiDeleteDialogOpen}
        onConfirm={handleFirstConfirm}
        documentsCount={documentsToDelete.length}
        isDeleting={isDeleting}
      />

      <DeleteMultipleDialog
        isOpen={doubleConfirmOpen}
        onOpenChange={setDoubleConfirmOpen}
        onConfirm={handleMultiDeleteConfirm}
        documentsCount={documentsToDelete.length}
        isDeleting={isDeleting}
        isFinalConfirmation
      />
    </>
  );
};

export default DocumentList;
