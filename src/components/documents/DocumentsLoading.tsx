
import { Loader2 } from "lucide-react";

const DocumentsLoading = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <Loader2 className="h-6 w-6 animate-spin mr-2" />
      <p>Loading documents...</p>
    </div>
  );
};

export default DocumentsLoading;
