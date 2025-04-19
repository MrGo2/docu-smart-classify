import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export function DocumentUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Generate a unique ID for the document
      const documentId = uuidv4();
      const fileExtension = file.name.split('.').pop();
      const storagePath = `documents/${documentId}.${fileExtension}`;

      // Create a custom upload handler to track progress
      const uploadWithProgress = async () => {
        const xhr = new XMLHttpRequest();
        const { data: uploadUrl } = await supabase.storage
          .from('documents')
          .createSignedUploadUrl(storagePath);

        if (!uploadUrl?.signedUrl) {
          throw new Error('Failed to get upload URL');
        }

        return new Promise<void>((resolve, reject) => {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentage = (event.loaded / event.total) * 100;
              setUploadProgress(Math.round(percentage));
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'));
          });

          xhr.open('PUT', uploadUrl.signedUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.send(file);
        });
      };

      // 1. Upload file to Supabase Storage with progress tracking
      await uploadWithProgress();

      // 2. Create document record in the database
      const { error: insertError, data: document } = await supabase
        .from('documents')
        .insert([
          {
            id: documentId,
            filename: file.name,
            file_type: file.type,
            file_size: file.size,
            storage_path: storagePath,
            extraction_complete: false,
            ocr_processed: false,
            content_markdown: null,
            content_structured: null,
            confidence_score: null,
            extraction_timestamp: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
        ])
        .select()
        .single();

      if (insertError) {
        // If document creation fails, clean up the uploaded file
        await supabase.storage
          .from('documents')
          .remove([storagePath]);
        throw new Error(`Failed to create document record: ${insertError.message}`);
      }

      // Navigate to the document viewer
      navigate(`/documents/${documentId}`);
    } catch (error) {
      console.error("Upload error:", error);
      setError(error instanceof Error ? error.message : 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,image/*"
                disabled={uploading}
              />

              <div className="flex flex-col gap-4">
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Uploading... {uploadProgress}%
                    </>
                  ) : (
                    "Upload Document"
                  )}
                </Button>

                {uploading && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>

              {file && (
                <div className="text-sm text-gray-500">
                  Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 