import { supabase } from "@/integrations/supabase/client";

export interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  extracted_text: string;
  content_markdown?: string;
  content_structured?: any;
  ocr_processed: boolean;
  project_id?: string;
  metadata?: Record<string, any>;
  extraction_complete: boolean;
  extraction_timestamp?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentSegment {
  id: string;
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
  created_at: string;
}

interface DocumentWithSegments {
  document: Document;
  segments: DocumentSegment[];
}

interface SearchOptions {
  projectId?: string;
  limit?: number;
  offset?: number;
  segmentTypes?: Array<DocumentSegment['segment_type']>;
  sortBy?: 'created_at' | 'updated_at' | 'filename';
  sortOrder?: 'asc' | 'desc';
}

interface SearchResult {
  documents: Array<Pick<Document, 'id' | 'filename' | 'file_type' | 'created_at'>>;
  segmentsByDocument: Record<string, DocumentSegment[]>;
  total: number;
}

/**
 * Get a document by ID with all its content
 */
export const getDocumentWithContent = async (documentId: string): Promise<DocumentWithSegments> => {
  // Get the document
  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();
    
  if (error) {
    console.error("Error fetching document:", error);
    throw new Error(`Failed to fetch document: ${error.message}`);
  }
  
  if (!document) {
    throw new Error(`Document not found with ID: ${documentId}`);
  }
  
  // Get document segments if available
  const { data: segments, error: segmentsError } = await supabase
    .from('document_segments')
    .select('*')
    .eq('document_id', documentId)
    .order('position_data->lineIndex', { ascending: true });
    
  if (segmentsError) {
    console.error("Error fetching segments:", segmentsError);
  }
  
  return {
    document: document as Document,
    segments: (segments || []) as DocumentSegment[]
  };
};

/**
 * Get a document thumbnail/preview URL
 */
export const getDocumentPreviewUrl = async (documentId: string): Promise<string | null> => {
  const { data: document, error } = await supabase
    .from('documents')
    .select('storage_path')
    .eq('id', documentId)
    .single();
    
  if (error || !document?.storage_path) {
    console.error("Error fetching document path:", error);
    return null;
  }
  
  try {
    // Get a signed URL that expires in 1 hour
    const { data, error: urlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(document.storage_path, 3600);
      
    if (urlError) {
      console.error("Error creating signed URL:", urlError);
      return null;
    }
    
    return data?.signedUrl || null;
  } catch (error) {
    console.error("Error generating preview URL:", error);
    return null;
  }
};

/**
 * Search for documents by content
 */
export const searchDocuments = async (
  searchQuery: string,
  options: SearchOptions = {}
): Promise<SearchResult> => {
  const { 
    projectId, 
    limit = 20, 
    offset = 0,
    segmentTypes,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = options;
  
  // First search in document content
  let query = supabase
    .from('documents')
    .select('id, filename, file_type, created_at', { count: 'exact' })
    .or(`extracted_text.ilike.%${searchQuery}%, content_markdown.ilike.%${searchQuery}%`)
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .limit(limit)
    .range(offset, offset + limit - 1);
    
  if (projectId) {
    query = query.eq('project_id', projectId);
  }
  
  const { data: documents, error, count } = await query;
  
  if (error) {
    console.error("Error searching documents:", error);
    throw new Error(`Failed to search documents: ${error.message}`);
  }
  
  // Then search in segments for more precise results
  let segmentsQuery = supabase
    .from('document_segments')
    .select('*')
    .or(`segment_text.ilike.%${searchQuery}%, segment_markdown.ilike.%${searchQuery}%`)
    .order('confidence_score', { ascending: false })
    .limit(limit * 3); // Get more segments to have better context
    
  if (segmentTypes && segmentTypes.length > 0) {
    segmentsQuery = segmentsQuery.in('segment_type', segmentTypes);
  }
  
  const { data: segments, error: segmentsError } = await segmentsQuery;
  
  if (segmentsError) {
    console.error("Error searching segments:", segmentsError);
  }
  
  // Combine results
  const documentIds = new Set(documents?.map(doc => doc.id) || []);
  const segmentDocumentIds = new Set(segments?.map(seg => seg.document_id) || []);
  
  // Get additional documents from segments if we haven't reached the limit
  if (documents && documents.length < limit && segments && segments.length > 0) {
    const additionalDocumentIds = Array.from(segmentDocumentIds)
      .filter(id => !documentIds.has(id))
      .slice(0, limit - documents.length);
      
    if (additionalDocumentIds.length > 0) {
      const { data: additionalDocs } = await supabase
        .from('documents')
        .select('id, filename, file_type, created_at')
        .in('id', additionalDocumentIds)
        .order(sortBy, { ascending: sortOrder === 'asc' });
        
      if (additionalDocs) {
        documents.push(...additionalDocs);
        additionalDocs.forEach(doc => documentIds.add(doc.id));
      }
    }
  }
  
  // Group segments by document
  const segmentsByDocument: Record<string, DocumentSegment[]> = {};
  segments?.forEach(segment => {
    if (!segmentsByDocument[segment.document_id]) {
      segmentsByDocument[segment.document_id] = [];
    }
    segmentsByDocument[segment.document_id].push(segment as DocumentSegment);
  });
  
  return {
    documents: documents || [],
    segmentsByDocument,
    total: count || 0
  };
};

/**
 * Get recent documents
 */
export const getRecentDocuments = async (
  options: Omit<SearchOptions, 'segmentTypes'> = {}
): Promise<Pick<Document, 'id' | 'filename' | 'file_type' | 'created_at'>[]> => {
  const { 
    projectId, 
    limit = 10, 
    offset = 0,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = options;
  
  let query = supabase
    .from('documents')
    .select('id, filename, file_type, created_at')
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .limit(limit)
    .range(offset, offset + limit - 1);
    
  if (projectId) {
    query = query.eq('project_id', projectId);
  }
  
  const { data: documents, error } = await query;
  
  if (error) {
    console.error("Error fetching recent documents:", error);
    throw new Error(`Failed to fetch recent documents: ${error.message}`);
  }
  
  return documents || [];
}; 