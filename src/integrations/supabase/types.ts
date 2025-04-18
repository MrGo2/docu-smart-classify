export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_keys: {
        Row: {
          api_key: string
          created_at: string | null
          id: string
          is_default: boolean | null
          service: string
          updated_at: string | null
        }
        Insert: {
          api_key: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          service: string
          updated_at?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          service?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      custom_prompts: {
        Row: {
          ai_model: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          project_id: string
          prompt_text: string
          prompt_type: string
          updated_at: string
        }
        Insert: {
          ai_model?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          project_id: string
          prompt_text: string
          prompt_type: string
          updated_at?: string
        }
        Update: {
          ai_model?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          project_id?: string
          prompt_text?: string
          prompt_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_prompts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          classification: string | null
          classification_text: string | null
          content_markdown: string | null
          content_structured: Json | null
          confidence_score: number | null
          extraction_complete: boolean
          extraction_timestamp: string | null
          created_at: string | null
          extracted_text: string | null
          extraction_strategy: string | null
          file_size: number
          file_type: string
          filename: string
          id: string
          metadata: Json | null
          ocr_processed: boolean | null
          project_id: string | null
          storage_path: string | null
          updated_at: string | null
        }
        Insert: {
          classification?: string | null
          classification_text?: string | null
          content_markdown?: string | null
          content_structured?: Json | null
          confidence_score?: number | null
          extraction_complete?: boolean
          extraction_timestamp?: string | null
          created_at?: string | null
          extracted_text?: string | null
          extraction_strategy?: string | null
          file_size: number
          file_type: string
          filename: string
          id?: string
          metadata?: Json | null
          ocr_processed?: boolean | null
          project_id?: string | null
          storage_path?: string | null
          updated_at?: string | null
        }
        Update: {
          classification?: string | null
          classification_text?: string | null
          content_markdown?: string | null
          content_structured?: Json | null
          confidence_score?: number | null
          extraction_complete?: boolean
          extraction_timestamp?: string | null
          created_at?: string | null
          extracted_text?: string | null
          extraction_strategy?: string | null
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          metadata?: Json | null
          ocr_processed?: boolean | null
          project_id?: string | null
          storage_path?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      document_segments: {
        Row: {
          id: string
          document_id: string
          segment_type: string
          segment_text: string
          segment_markdown: string | null
          segment_data: Json | null
          position_data: Json | null
          confidence_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          segment_type: string
          segment_text: string
          segment_markdown?: string | null
          segment_data?: Json | null
          position_data?: Json | null
          confidence_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          segment_type?: string
          segment_text?: string
          segment_markdown?: string | null
          segment_data?: Json | null
          position_data?: Json | null
          confidence_score?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_segments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          }
        ]
      }
      extraction_variables: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          document_type: string
          extraction_prompt: string
          id: string
          is_required: boolean | null
          name: string
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          document_type: string
          extraction_prompt: string
          id?: string
          is_required?: boolean | null
          name: string
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          document_type?: string
          extraction_prompt?: string
          id?: string
          is_required?: boolean | null
          name?: string
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extraction_variables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_name: string | null
          created_at: string
          default_ai_model: string | null
          default_ocr_language: string
          default_ocr_provider: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          client_name?: string | null
          created_at?: string
          default_ai_model?: string | null
          default_ocr_language?: string
          default_ocr_provider?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          client_name?: string | null
          created_at?: string
          default_ai_model?: string | null
          default_ocr_language?: string
          default_ocr_provider?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
