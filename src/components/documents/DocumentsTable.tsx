
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Document } from "@/types/document";
import DocumentRow from "./DocumentRow";

interface DocumentsTableProps {
  documents: Document[];
  onViewDocument: (document: Document) => void;
  onDeleteClick: (document: Document) => void;
}

const DocumentsTable = ({ documents, onViewDocument, onDeleteClick }: DocumentsTableProps) => {
  return (
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
  );
};

export default DocumentsTable;
