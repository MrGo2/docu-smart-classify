
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

interface FileUploadAreaProps {
  supportedTypes: string[];
  file: File | null;
  onFileSelect: (file: File) => void;
  onError: (error: string) => void;
  isDisabled: boolean;
}

const FileUploadArea = ({
  supportedTypes,
  file,
  onFileSelect,
  onError,
  isDisabled,
}: FileUploadAreaProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const selectedFile = acceptedFiles[0];

      // Verify file type
      if (!supportedTypes.includes(selectedFile.type)) {
        onError(
          "Unsupported file type. Please upload a PDF, image, or Office document."
        );
        return;
      }

      onFileSelect(selectedFile);
    },
    [onFileSelect, onError, supportedTypes]
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
    maxFiles: 1,
    disabled: isDisabled,
  });

  return (
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
        {file ? (
          <p className="text-sm">
            Selected: <span className="font-semibold">{file.name}</span>{" "}
            ({(file.size / 1024).toFixed(1)} KB)
          </p>
        ) : isDragActive ? (
          <p>Drop the file here...</p>
        ) : (
          <p>Drag & drop a document, or click to select</p>
        )}
        <p className="text-xs text-gray-500">
          Supported formats: PDF, JPG, PNG, DOCX
        </p>
      </div>
    </div>
  );
};

export default FileUploadArea;
