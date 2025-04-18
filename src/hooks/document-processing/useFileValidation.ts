
export const useFileValidation = () => {
  const supportedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const canExtractContent = (fileType: string): boolean => {
    return supportedTypes.includes(fileType);
  };

  return {
    supportedTypes,
    canExtractContent,
  };
};
