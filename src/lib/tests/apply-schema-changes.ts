import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { mockStaticAssets, getAssetPath, isValidAssetPath, getAssetType } from '../lib/tests/__mocks__/staticAssets.mock';

const supabaseUrl = 'https://hshepgzbhetelxqzmvvb.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  console.error('❌ Missing Supabase anon key. Please provide it as SUPABASE_ANON_KEY environment variable.');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function applySchemaChanges() {
  try {
    console.log('Checking current schema...');

    // Check if columns exist in documents table
    const { data: columns, error: columnsError } = await supabase
      .from('documents')
      .select('content_markdown, content_structured, confidence_score, extraction_complete, extraction_timestamp')
      .limit(1);

    if (columnsError) {
      console.log('\n⚠️ New columns needed in documents table. Please run the following SQL in your Supabase dashboard:');
      console.log(`
-- Enhance documents table with new columns for improved extraction
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS content_markdown TEXT,
  ADD COLUMN IF NOT EXISTS content_structured JSONB,
  ADD COLUMN IF NOT EXISTS confidence_score FLOAT,
  ADD COLUMN IF NOT EXISTS extraction_complete BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS extraction_timestamp TIMESTAMPTZ;`);
    } else {
      console.log('✅ Documents table columns are up to date');
    }

    // Check if document_segments table exists
    const { data: segments, error: segmentsError } = await supabase
      .from('document_segments')
      .select('id')
      .limit(1);

    if (segmentsError) {
      console.log('\n⚠️ Document segments table needed. Please run the following SQL in your Supabase dashboard:');
      console.log(`
-- Create new table for document segments
CREATE TABLE IF NOT EXISTS document_segments (
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
CREATE INDEX IF NOT EXISTS idx_document_segments_document_id ON document_segments(document_id);
CREATE INDEX IF NOT EXISTS idx_document_segments_segment_type ON document_segments(segment_type);

-- Add helpful comments
COMMENT ON TABLE document_segments IS 'Stores individual segments/parts of processed documents';
COMMENT ON COLUMN document_segments.segment_type IS 'Type of segment (e.g., header, paragraph, table, list)';
COMMENT ON COLUMN document_segments.segment_text IS 'Raw text content of the segment';
COMMENT ON COLUMN document_segments.segment_markdown IS 'Markdown formatted content of the segment';
COMMENT ON COLUMN document_segments.segment_data IS 'Structured data extracted from the segment';
COMMENT ON COLUMN document_segments.position_data IS 'Position and layout information of the segment';
COMMENT ON COLUMN document_segments.confidence_score IS 'Confidence score of the extraction/processing';`);
    } else {
      console.log('✅ Document segments table exists');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the schema check
applySchemaChanges(); 