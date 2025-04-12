
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Document } from "@/types/document";
import DocumentRow from "./DocumentRow";
import DocumentsPagination from "./DocumentsPagination";

interface DocumentsTableProps {
  documents: Document[];
  onViewDocument: (document: Document) => void;
  onDeleteClick: (document: Document) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
}

const DocumentsTable = ({ 
  documents, 
  onViewDocument, 
  onDeleteClick,
  currentPage,
  totalPages,
  onPageChange,
  totalCount
}: DocumentsTableProps) => {
  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground">
        {totalCount} document{totalCount !== 1 ? 's' : ''}
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
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
