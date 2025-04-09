
/**
 * Helper functions for file validation
 */

export const getSupportedFileTypes = () => [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const getReadableFileTypes = () => [
  "PDF", "JPG", "PNG", "DOCX"
];

export const validateFileType = (file: File, supportedTypes: string[]): boolean => {
  return supportedTypes.includes(file.type);
};

export const getFileSize = (file: File): string => {
  const sizeInKB = file.size / 1024;
  if (sizeInKB < 1024) {
    return `${sizeInKB.toFixed(1)} KB`;
  } else {
    return `${(sizeInKB / 1024).toFixed(1)} MB`;
  }
};
