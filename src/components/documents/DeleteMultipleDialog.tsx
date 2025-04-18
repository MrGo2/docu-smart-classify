
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface DeleteMultipleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  documentsCount: number;
  isDeleting: boolean;
  isFinalConfirmation?: boolean;
}

const DeleteMultipleDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  documentsCount,
  isDeleting,
  isFinalConfirmation
}: DeleteMultipleDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {isFinalConfirmation ? "Final Confirmation" : "Delete Multiple Documents"}
          </h2>
          <p className={`mb-6 ${isFinalConfirmation ? 'text-red-600' : ''}`}>
            {isFinalConfirmation
              ? `Are you absolutely sure? This action CANNOT be undone. ${documentsCount} document${documentsCount !== 1 ? 's' : ''} will be permanently deleted.`
              : `You are about to delete ${documentsCount} document${documentsCount !== 1 ? 's' : ''}. Would you like to proceed?`
            }
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={onConfirm}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete {documentsCount} document{documentsCount !== 1 ? 's' : ''}</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteMultipleDialog;
