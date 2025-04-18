
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Document } from "@/types/document";
import DocumentViewer from "@/components/DocumentViewer";

interface DocumentViewerDialogProps {
  document: Document | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentViewerDialog = ({
  document,
  isOpen,
  onOpenChange,
}: DocumentViewerDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        {document && <DocumentViewer document={document} />}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewerDialog;
