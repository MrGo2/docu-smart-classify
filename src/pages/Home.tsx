import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRecentDocuments } from "@/services/documentRetrieval";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Document } from "@/services/documentRetrieval";
import { SupabaseConnectionTest } from "@/components/SupabaseConnectionTest";

export function Home() {
  console.log("Home component rendering"); // Debug log
  const [recentDocuments, setRecentDocuments] = useState<Pick<Document, 'id' | 'filename' | 'file_type' | 'created_at'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecentDocuments = async () => {
      console.log("Loading recent documents"); // Debug log
      try {
        const documents = await getRecentDocuments({ limit: 10 });
        console.log("Documents loaded:", documents); // Debug log
        setRecentDocuments(documents);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load documents';
        console.error("Error loading recent documents:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadRecentDocuments();
  }, []);

  // Early return for error state
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-500">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Document Management</h1>
        <Button asChild>
          <Link to="/documents/upload">Upload Document</Link>
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <SupabaseConnectionTest />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : recentDocuments.length > 0 ? (
              <div className="space-y-4">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <Link
                        to={`/documents/${doc.id}`}
                        className="text-lg font-medium hover:underline"
                      >
                        {doc.filename}
                      </Link>
                      <div className="text-sm text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{doc.file_type}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No documents found. Start by uploading a document.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 