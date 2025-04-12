
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateFileType } from "@/utils/fileValidation";

interface MultiFileUploadAreaProps {
  supportedTypes: string[];
  files: File[];
  onFilesSelect: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onError: (error: string) => void;
  isDisabled: boolean;
  maxFiles?: number;
}

const MultiFileUploadArea = ({
  supportedTypes,
  files,
  onFilesSelect,
  onRemoveFile,
  onError,
  isDisabled,
  maxFiles = 10,
}: MultiFileUploadAreaProps) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      
      // Check if adding these files would exceed the max limit
      if (files.length + acceptedFiles.length > maxFiles) {
        const errorMsg = `You can only upload a maximum of ${maxFiles} files at once`;
        setError(errorMsg);
        onError(errorMsg);
        return;
      }

      // Validate all files
      const invalidFiles = acceptedFiles.filter(
        (file) => !validateFileType(file, supportedTypes)
      );

      if (invalidFiles.length > 0) {
        const errorMsg = "Some files have unsupported formats. Please upload only PDF, JPG, PNG, or Office documents.";
        setError(errorMsg);
        onError(errorMsg);
        
        // Filter out invalid files
        const validFiles = acceptedFiles.filter(
          (file) => validateFileType(file, supportedTypes)
        );
        
        if (validFiles.length > 0) {
          onFilesSelect(validFiles);
        }
        return;
      }

      setError(null);
      onFilesSelect(acceptedFiles);
    },
    [files, onFilesSelect, onError, supportedTypes, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
    },
    disabled: isDisabled,
    maxFiles: maxFiles,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-primary"
        } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-8 w-8 text-gray-500" />
          {isDragActive ? (
            <p>Drop the files here...</p>
          ) : (
            <p>Drag & drop multiple documents, or click to select</p>
          )}
          <p className="text-xs text-gray-500">
            Supported formats: PDF, JPG, PNG, DOCX
          </p>
          <p className="text-xs text-gray-500">
            Maximum {maxFiles} files at once
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected files ({files.length}):</p>
          <ul className="border rounded-md divide-y">
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="flex items-center justify-between p-2 hover:bg-muted/50">
                <div className="truncate">
                  <span className="font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFile(index)}
                  disabled={isDisabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiFileUploadArea;
