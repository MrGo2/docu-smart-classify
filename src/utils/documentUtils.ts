
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / 1048576).toFixed(1) + " MB";
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};

export const getFileTypeDisplay = (fileType: string): string => {
  if (fileType.includes("pdf")) return "PDF";
  if (fileType.includes("jpeg") || fileType.includes("jpg")) return "JPEG";
  if (fileType.includes("png")) return "PNG";
  if (fileType.includes("word")) return "Word";
  return fileType.split("/")[1]?.toUpperCase() || fileType;
};
