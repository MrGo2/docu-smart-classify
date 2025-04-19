import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocumentWithContent, getDocumentPreviewUrl } from "@/services/documentRetrieval";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { Document, DocumentSegment } from "@/services/documentRetrieval";
import { Spinner } from '@/components/ui/spinner';

interface DocumentViewerProps {
  className?: string;
}

export function DocumentViewer({ className }: DocumentViewerProps) {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [segments, setSegments] = useState<DocumentSegment[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const loadDocument = async () => {
      if (!id) {
        setError("No document ID provided");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Load document content and segments
        const { document, segments } = await getDocumentWithContent(id);
        setDocument(document);
        setSegments(segments);
        
        // Get preview URL if it's an image or PDF
        if (document.file_type.startsWith('image/') || document.file_type === 'application/pdf') {
          const url = await getDocumentPreviewUrl(id);
          setPreviewUrl(url);
        }
      } catch (error) {
        console.error("Error loading document:", error);
        setError(error instanceof Error ? error.message : 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };
    
    loadDocument();
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }
  
  if (error || !document) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error || "Document not found"}
        </AlertDescription>
      </Alert>
    );
  }
  
  const segmentsByType = segments.reduce((acc, segment) => {
    if (!acc[segment.segment_type]) {
      acc[segment.segment_type] = [];
    }
    acc[segment.segment_type].push(segment);
    return acc;
  }, {} as Record<DocumentSegment['segment_type'], DocumentSegment[]>);
  
  return (
    <div className={`container mx-auto py-8 ${className || ''}`}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{document.filename}</h1>
        <div className="flex gap-2 text-sm text-gray-500">
          <span>Type: {document.file_type}</span>
          <Separator orientation="vertical" className="h-4" />
          <span>Size: {formatFileSize(document.file_size)}</span>
          {document.ocr_processed && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <span>OCR Processed</span>
            </>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="preview">Document Preview</TabsTrigger>
          <TabsTrigger value="extracted">Extracted Content</TabsTrigger>
          <TabsTrigger value="markdown">Markdown</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="min-h-[500px]">
          {previewUrl ? (
            document.file_type.startsWith('image/') ? (
              <img 
                src={previewUrl} 
                alt={document.filename}
                className="max-w-full max-h-[800px] object-contain mx-auto border rounded-lg shadow-sm"
              />
            ) : (
              <iframe 
                src={previewUrl} 
                className="w-full h-[800px] border rounded-lg shadow-sm" 
                title={document.filename}
              />
            )
          ) : (
            <div className="flex items-center justify-center h-64 border rounded-lg bg-gray-50">
              <span className="text-gray-500">Preview not available</span>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="extracted">
          <Card>
            <CardContent className="p-6">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg overflow-auto max-h-[800px]">
                {document.extracted_text || "No extracted text available"}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="markdown">
          <Card>
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none">
                {document.content_markdown ? (
                  <div dangerouslySetInnerHTML={{ __html: document.content_markdown }} />
                ) : (
                  <span className="text-gray-500">No markdown content available</span>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="segments">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {Object.entries(segmentsByType).map(([type, segments]) => (
                  <div key={type} className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                      <Badge variant="secondary" className="text-xs">
                        {segments.length}
                      </Badge>
                    </h3>
                    <div className="space-y-3">
                      {segments.map((segment, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                          <div className="prose prose-sm">
                            {segment.segment_markdown ? (
                              <div dangerouslySetInnerHTML={{ __html: segment.segment_markdown }} />
                            ) : (
                              <div>{segment.segment_text}</div>
                            )}
                          </div>
                          {segment.confidence_score && (
                            <div className="mt-2 text-xs text-gray-500">
                              Confidence: {(segment.confidence_score * 100).toFixed(1)}%
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {segments.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No segments available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 