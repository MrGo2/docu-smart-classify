
import { useFileState } from "./document-processing/useFileState";
import { useProcessingState } from "./document-processing/useProcessingState";
import { useApiKey } from "./document-processing/useApiKey";
import { useFileValidation } from "./document-processing/useFileValidation";
import { performOcr, needsOcr } from "@/utils/ocrProcessor";
import { classifyDocument } from "@/services/aiClassifier";
import { uploadDocumentToStorage } from "@/services/documentStorage";
import { TextExtractionService } from "@/lib/extraction/textExtractionService";

export const useDocumentProcessing = (
  onProcessingStart: () => void,
  onProcessingComplete: () => void,
  onProcessingError: (error: string) => void
) => {
  const fileState = useFileState();
  const processingState = useProcessingState();
  const { getApiKey } = useApiKey();
  const { supportedTypes, canExtractContent } = useFileValidation();

  const processDocument = async (documentFile?: File) => {
    const fileToProcess = documentFile || fileState.file;
    if (!fileToProcess) return;

    processingState.setIsProcessing(true);
    onProcessingStart();
    processingState.setProgress(0);

    try {
      processingState.setStatusMessage("Getting API key...");
      const apiKey = await getApiKey(fileState.modelSelection);
      if (!apiKey) {
        throw new Error(`No API key configured for ${fileState.modelSelection}. Please add one first.`);
      }

      processingState.setProgress(5);
      const isContentExtractable = canExtractContent(fileToProcess.type);
      let extractedFullText = "";
      let classificationText = "";

      if (isContentExtractable) {
        if (needsOcr(fileToProcess)) {
          const result = await performOcr(
            fileToProcess,
            (progress) => {
              const scaledProgress = 5 + Math.floor(progress * 0.7);
              processingState.setProgress(scaledProgress);
              processingState.setStatusMessage(
                progress < 40 ? "Initializing OCR engine..." :
                progress < 70 ? "Extracting text from document pages..." :
                "Finalizing text extraction..."
              );
            },
            fileState.ocrLanguage,
            fileState.ocrProvider
          );

          extractedFullText = result.text;
          if (fileState.ocrLanguage === 'auto' && result.detectedLanguage) {
            fileState.setDetectedLanguage(result.detectedLanguage);
          }
        }

        processingState.setStatusMessage(`Applying ${fileState.extractionStrategy} extraction strategy...`);
        const extractionResult = TextExtractionService.extractTextForClassification(
          extractedFullText,
          ["=== PAGE BREAK ==="],
          {
            strategy: fileState.extractionStrategy,
            maxClassificationLength: 2000
          }
        );
        classificationText = extractionResult.classificationText;
      }

      processingState.setStatusMessage("Classifying document with AI...");
      const classification = await classifyDocument(
        classificationText,
        apiKey,
        fileState.modelSelection,
        (classifyProgress) => {
          const scaledProgress = 75 + Math.floor(classifyProgress * 0.15);
          processingState.setProgress(scaledProgress);
        },
        fileToProcess
      );

      processingState.setStatusMessage("Saving document to storage...");
      await uploadDocumentToStorage(
        fileToProcess,
        classification,
        extractedFullText,
        classificationText,
        fileState.extractionStrategy,
        needsOcr(fileToProcess) && isContentExtractable,
        (uploadProgress) => {
          const scaledProgress = 90 + Math.floor(uploadProgress * 0.1);
          processingState.setProgress(scaledProgress);
        },
        fileState.selectedProject
      );

      processingState.setStatusMessage("Processing complete!");
      fileState.setFile(null);
      processingState.setIsProcessing(false);
      onProcessingComplete();
    } catch (error: any) {
      console.error("Processing error:", error);
      processingState.setIsProcessing(false);
      onProcessingError(error.message || "An unknown error occurred");
    }
  };

  return {
    ...fileState,
    progress: processingState.progress,
    isProcessing: processingState.isProcessing,
    statusMessage: processingState.statusMessage,
    supportedTypes,
    processDocument,
  };
};
