-- Enhance documents table with new columns for improved extraction
ALTER TABLE documents 
  ADD COLUMN content_markdown TEXT,
  ADD COLUMN content_structured JSONB,
  ADD COLUMN confidence_score FLOAT,
  ADD COLUMN extraction_complete BOOLEAN DEFAULT FALSE,
  ADD COLUMN extraction_timestamp TIMESTAMPTZ;

-- Create new table for document segments
CREATE TABLE document_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  segment_type TEXT NOT NULL,
  segment_text TEXT NOT NULL,
  segment_markdown TEXT,
  segment_data JSONB,
  position_data JSONB,
  confidence_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster segment retrieval
CREATE INDEX idx_document_segments_document_id ON document_segments(document_id);
CREATE INDEX idx_document_segments_segment_type ON document_segments(segment_type);

-- Update types in the database
COMMENT ON TABLE document_segments IS 'Stores individual segments/parts of processed documents';
COMMENT ON COLUMN document_segments.segment_type IS 'Type of segment (e.g., header, paragraph, table, list)';
COMMENT ON COLUMN document_segments.segment_text IS 'Raw text content of the segment';
COMMENT ON COLUMN document_segments.segment_markdown IS 'Markdown formatted content of the segment';
COMMENT ON COLUMN document_segments.segment_data IS 'Structured data extracted from the segment';
COMMENT ON COLUMN document_segments.position_data IS 'Position and layout information of the segment';
COMMENT ON COLUMN document_segments.confidence_score IS 'Confidence score of the extraction/processing'; 