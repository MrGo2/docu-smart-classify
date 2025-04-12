
export interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  classification: string | null;
  created_at: string;
  extracted_text: string | null;
  metadata?: Record<string, any> | null;
  project_id?: string | null;
  ocr_processed?: boolean | null;
  selected?: boolean; // Added to track selection state
  extraction_strategy?: string | null; // Strategy used for text extraction
  classification_text?: string | null; // Text used for classification (subset of extracted_text)
}
