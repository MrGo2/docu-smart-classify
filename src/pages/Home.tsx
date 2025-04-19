import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRecentDocuments } from "@/services/documentRetrieval";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Document } from "@/services/documentRetrieval";

export function Home() {
  const [recentDocuments, setRecentDocuments] = useState<Pick<Document, 'id' | 'filename' | 'file_type' | 'created_at'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentDocuments = async () => {
      try {
        const documents = await getRecentDocuments({ limit: 10 });
        setRecentDocuments(documents);
      } catch (error) {
        console.error("Error loading recent documents:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentDocuments();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Document Management</h1>
        <Button asChild>
          <Link to="/documents/upload">Upload Document</Link>
        </Button>
      </div>

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
  );
} 