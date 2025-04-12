
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";

interface FailedFilesDisplayProps {
  failedFiles: { name: string; error: string }[];
}

const FailedFilesDisplay: React.FC<FailedFilesDisplayProps> = ({ failedFiles }) => {
  if (failedFiles.length === 0) return null;

  return (
    <div className="mt-4">
      <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
        <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
        <AlertDescription>
          {`${failedFiles.length} file${failedFiles.length > 1 ? "s" : ""} failed processing`}
        </AlertDescription>
      </Alert>
      <div className="mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
        <ul className="space-y-1">
          {failedFiles.map((file, idx) => (
            <li key={idx} className="text-sm flex">
              <X className="h-4 w-4 text-red-500 mr-1 flex-shrink-0" />
              <span className="font-medium">{file.name}:</span>
              <span className="ml-1 text-gray-600 truncate">{file.error}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FailedFilesDisplay;
