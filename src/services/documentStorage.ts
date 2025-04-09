
import { supabase } from "@/integrations/supabase/client";
import { getFileExtension } from "@/utils/ocrProcessor";

/**
 * Sanitizes text to remove invalid Unicode escape sequences
 * that cause PostgreSQL errors
 */
const sanitizeText = (text: string): string => {
  if (!text) return "";
  
  // Replace null bytes (\u0000) which cause PostgreSQL errors
  return text.replace(/\u0000/g, " ");
};

/**
 * Uploads a file to Supabase storage and saves its metadata
 */
export const uploadDocumentToStorage = async (
  file: File,
  classification: string,
  extractedText: string,
  ocrProcessed: boolean,
  onProgressUpdate: (progress: number) => void
): Promise<void> => {
  try {
    // Generate a unique filename
    const fileExt = getFileExtension(file.name);
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const storagePath = `${fileName}`;
    
    // 1. Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, file);
      
    if (uploadError) throw new Error("Failed to upload document to storage");
    
    onProgressUpdate(95);
    
    // 2. Save document metadata to the database - sanitize text first
    const sanitizedText = sanitizeText(extractedText);
    
    const { error: insertError } = await supabase.from("documents").insert({
      filename: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: storagePath,
      classification: classification,
      extracted_text: sanitizedText,
      ocr_processed: ocrProcessed,
    });
    
    if (insertError) throw new Error("Failed to save document metadata");
    
    onProgressUpdate(100);
  } catch (error) {
    console.error("Storage error:", error);
    throw new Error(`Failed to store document: ${error instanceof Error ? error.message : String(error)}`);
  }
};
