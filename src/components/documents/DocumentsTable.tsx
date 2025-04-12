
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Document } from "@/types/document";
import DocumentRow from "./DocumentRow";
import DocumentsPagination from "./DocumentsPagination";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, CheckSquare, Square } from "lucide-react";
import { useState } from "react";

interface DocumentsTableProps {
  documents: Document[];
  onViewDocument: (document: Document) => void;
  onDeleteClick: (document: Document) => void;
  onDeleteMultiple?: (documentIds: string[]) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
}

const DocumentsTable = ({ 
  documents, 
  onViewDocument, 
  onDeleteClick,
  onDeleteMultiple,
  currentPage,
  totalPages,
  onPageChange,
  totalCount
}: DocumentsTableProps) => {
  const [selectedDocuments, setSelectedDocuments] = useState<Record<string, boolean>>({});
  const [allSelected, setAllSelected] = useState(false);

  const handleSelectAll = () => {
    const newSelectedState = !allSelected;
    setAllSelected(newSelectedState);
    
    const newSelectedDocuments: Record<string, boolean> = {};
    documents.forEach(doc => {
      newSelectedDocuments[doc.id] = newSelectedState;
    });
    
    setSelectedDocuments(newSelectedDocuments);
  };

  const handleSelectDocument = (docId: string, selected: boolean) => {
    setSelectedDocuments(prev => ({
      ...prev,
      [docId]: selected
    }));
    
    // Check if all are selected to update the header checkbox
    const updatedSelection = {
      ...selectedDocuments,
      [docId]: selected
    };
    
    const allDocsSelected = documents.every(doc => updatedSelection[doc.id]);
    setAllSelected(allDocsSelected);
  };

  const getSelectedDocumentIds = () => {
    return Object.entries(selectedDocuments)
      .filter(([_, isSelected]) => isSelected)
      .map(([docId, _]) => docId);
  };

  const selectedCount = getSelectedDocumentIds().length;
  const hasSelection = selectedCount > 0;

  const handleDeleteSelected = () => {
    if (onDeleteMultiple && hasSelection) {
      onDeleteMultiple(getSelectedDocumentIds());
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {totalCount} document{totalCount !== 1 ? 's' : ''}
          {hasSelection && ` (${selectedCount} selected)`}
        </div>
        
        {hasSelection && onDeleteMultiple && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDeleteSelected}
            className="flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Selected ({selectedCount})
          </Button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {onDeleteMultiple && (
                <TableHead className="w-[40px]">
                  <div className="flex items-center">
                    <Checkbox
                      checked={allSelected && documents.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all documents"
                    />
                  </div>
                </TableHead>
              )}
              <TableHead>Filename</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Classification</TableHead>
              <TableHead>Processed Date</TableHead>
              <TableHead className="w-[160px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <DocumentRow 
                key={doc.id}
                document={doc}
                onView={onViewDocument}
                onDelete={onDeleteClick}
                onSelect={onDeleteMultiple ? handleSelectDocument : undefined}
                isSelected={!!selectedDocuments[doc.id]}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      
      <DocumentsPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default DocumentsTable;
