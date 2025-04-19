import { supabase } from "@/integrations/supabase/client";
import { getFileExtension } from "@/utils/ocrProcessor";
import { ExtractionStrategy } from "@/lib/extraction/types";
import { convertToMarkdown } from "@/services/markupService";
import { detectDocumentStructure } from "@/utils/documentStructureDetector";

interface FileMetadata {
  createdAt: string;
  modifiedAt: string;
  author?: string;
  title?: string;
  [key: string]: any;
}

interface DocumentSegment {
  document_id: string;
  segment_type: 'heading' | 'key_value' | 'table' | 'paragraph' | 'list';
  segment_text: string;
  segment_markdown: string;
  segment_data: any;
  position_data: {
    lineIndex?: number;
    startLineIndex?: number;
    endLineIndex?: number;
  };
  confidence_score: number;
}

/**
 * Extracts metadata from a file
 */
function extractFileMetadata(file: File): FileMetadata {
  return {
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    size: file.size,
    type: file.type,
    name: file.name
  };
}

/**
 * Sanitizes extracted text by removing unwanted characters and normalizing whitespace
 */
function sanitizeText(text: string): string {
  return text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Uploads a file to Supabase storage and saves its metadata with enhanced markup
 */
export const uploadDocumentToStorage = async (
  file: File,
  extractedText: string,
  ocrProcessed: boolean,
  onProgressUpdate: (progress: number) => void,
  projectId?: string
): Promise<void> => {
  try {
    // Generate a unique filename
    const fileExt = getFileExtension(file.name);
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const storagePath = `${fileName}`;
    
    // Extract file metadata
    const metadata = extractFileMetadata(file);
    
    // 1. Upload file to Supabase Storage
    const { error: uploadError, data: storageData } = await supabase.storage
      .from("documents")
      .upload(storagePath, file);
      
    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw new Error("Failed to upload document to storage");
    }
    
    onProgressUpdate(80);
    
    // 2. Generate structured data and markdown
    const sanitizedText = sanitizeText(extractedText);
    const structure = detectDocumentStructure(sanitizedText);
    const { markdown } = convertToMarkdown(sanitizedText);
    
    onProgressUpdate(90);
    
    // 3. Save document metadata to the database
    const { error: insertError, data: documentData } = await supabase.from("documents").insert({
      filename: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: storagePath,
      extracted_text: sanitizedText,
      content_markdown: markdown,
      content_structured: JSON.parse(JSON.stringify(structure)),
      ocr_processed: ocrProcessed,
      project_id: projectId || null,
      metadata: metadata,
      extraction_complete: true,
      extraction_timestamp: new Date().toISOString()
    }).select().single();
    
    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error("Failed to save document metadata");
    }
    
    // 4. Save document segments for easier retrieval
    if (documentData) {
      await saveDocumentSegments(documentData.id, structure);
    }
    
    onProgressUpdate(100);
  } catch (error) {
    console.error("Storage error:", error);
    throw new Error(`Failed to store document: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Saves document segments to the database
 */
async function saveDocumentSegments(documentId: string, structure: ReturnType<typeof detectDocumentStructure>) {
  const segments: DocumentSegment[] = [];
  
  // Add headings as segments
  if (structure.headings) {
    for (const heading of structure.headings) {
      segments.push({
        document_id: documentId,
        segment_type: 'heading',
        segment_text: heading.text,
        segment_markdown: '#'.repeat(heading.level) + ' ' + heading.text,
        segment_data: { level: heading.level },
        position_data: { lineIndex: heading.lineIndex },
        confidence_score: 0.9 // Headings are usually high confidence
      });
    }
  }
  
  // Add key-value pairs as segments
  if (structure.keyValuePairs) {
    for (const pair of structure.keyValuePairs) {
      segments.push({
        document_id: documentId,
        segment_type: 'key_value',
        segment_text: `${pair.key}: ${pair.value}`,
        segment_markdown: `**${pair.key}:** ${pair.value}`,
        segment_data: { key: pair.key, value: pair.value },
        position_data: { lineIndex: pair.lineIndex },
        confidence_score: 0.85
      });
    }
  }
  
  // Add tables as segments
  if (structure.tables) {
    for (const table of structure.tables) {
      segments.push({
        document_id: documentId,
        segment_type: 'table',
        segment_text: JSON.stringify(table.headers) + JSON.stringify(table.rows),
        segment_markdown: generateTableMarkdown(table),
        segment_data: { headers: table.headers, rows: table.rows },
        position_data: { 
          startLineIndex: table.startLineIndex,
          endLineIndex: table.endLineIndex
        },
        confidence_score: 0.75 // Tables are more challenging for OCR
      });
    }
  }
  
  // Add lists as segments
  if (structure.lists) {
    for (const list of structure.lists) {
      const listItems = list.items.map(item => item.text);
      segments.push({
        document_id: documentId,
        segment_type: 'list',
        segment_text: listItems.join('\n'),
        segment_markdown: list.items.map(item => 
          `${list.ordered ? '1. ' : '- '}${item.text}`
        ).join('\n'),
        segment_data: { 
          ordered: list.ordered,
          items: list.items.map(item => ({
            text: item.text,
            lineIndex: item.lineIndex
          }))
        },
        position_data: {
          startLineIndex: Math.min(...list.items.map(item => item.lineIndex)),
          endLineIndex: Math.max(...list.items.map(item => item.lineIndex))
        },
        confidence_score: 0.8
      });
    }
  }
  
  // Add paragraphs as segments
  if (structure.paragraphs) {
    for (const paragraph of structure.paragraphs) {
      segments.push({
        document_id: documentId,
        segment_type: 'paragraph',
        segment_text: paragraph.text,
        segment_markdown: paragraph.text,
        segment_data: null,
        position_data: { lineIndex: paragraph.lineIndex },
        confidence_score: 0.8
      });
    }
  }
  
  // Insert segments in batches of 50
  if (segments.length > 0) {
    for (let i = 0; i < segments.length; i += 50) {
      const batch = segments.slice(i, i + 50);
      const { error } = await supabase.from('document_segments').insert(batch);
      
      if (error) {
        console.error("Error saving document segments:", error);
      }
    }
  }
}

/**
 * Generate markdown for a table
 */
function generateTableMarkdown(table: ReturnType<typeof detectDocumentStructure>['tables'][0]): string {
  let markdown = '';
  
  if (table.headers && table.headers.length > 0) {
    // Table headers
    markdown += '| ' + table.headers.join(' | ') + ' |\n';
    // Table separator
    markdown += '| ' + table.headers.map(() => '---').join(' | ') + ' |\n';
    
    // Table rows
    if (table.rows) {
      table.rows.forEach((row: string[]) => {
        markdown += '| ' + row.join(' | ') + ' |\n';
      });
    }
  }
  
  return markdown;
}
