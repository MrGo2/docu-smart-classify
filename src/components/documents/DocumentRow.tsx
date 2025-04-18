
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { Eye, Trash2 } from "lucide-react";
import { Document } from "@/types/document";
import { formatFileSize, formatDate, getFileTypeDisplay } from "@/utils/documentUtils";

interface DocumentRowProps {
  document: Document;
  onView: (document: Document) => void;
  onDelete: (document: Document) => void;
  onSelect?: (documentId: string, selected: boolean) => void;
  isSelected?: boolean;
}

const DocumentRow = ({ document, onView, onDelete, onSelect, isSelected }: DocumentRowProps) => {
  return (
    <TableRow key={document.id}>
      {onSelect !== undefined && (
        <TableCell className="pr-0 w-[40px]">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(document.id, checked === true)}
            aria-label={`Select ${document.filename}`}
          />
        </TableCell>
      )}
      <TableCell className="font-medium">{document.filename}</TableCell>
      <TableCell>{getFileTypeDisplay(document.file_type)}</TableCell>
      <TableCell>{formatFileSize(document.file_size)}</TableCell>
      <TableCell>
        {document.classification || "Unclassified"}
      </TableCell>
      <TableCell>{formatDate(document.created_at)}</TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onView(document)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(document)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default DocumentRow;
