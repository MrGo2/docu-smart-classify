
export interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  classification: string | null;
  created_at: string;
  extracted_text: string | null;
  metadata?: Record<string, any>;
  project_id?: string | null;
}
