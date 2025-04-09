
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DocumentViewer from "./DocumentViewer";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  classification: string | null;
  created_at: string;
}

interface DocumentListProps {
  refreshTrigger: number;
}

const DocumentList = ({ refreshTrigger }: DocumentListProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  // Fetch documents from Supabase
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setDocuments(data || []);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [refreshTrigger]);

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setViewerOpen(true);
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  // Get file type display name
  const getFileTypeDisplay = (fileType: string): string => {
    if (fileType.includes("pdf")) return "PDF";
    if (fileType.includes("jpeg") || fileType.includes("jpg")) return "JPEG";
    if (fileType.includes("png")) return "PNG";
    if (fileType.includes("word")) return "Word";
    return fileType.split("/")[1]?.toUpperCase() || fileType;
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <p>Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No documents processed yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Processed Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.filename}</TableCell>
                  <TableCell>{getFileTypeDisplay(doc.file_type)}</TableCell>
                  <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                  <TableCell>
                    {doc.classification || "Unclassified"}
                  </TableCell>
                  <TableCell>{formatDate(doc.created_at)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewDocument(doc)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-4xl h-[80vh] p-0">
          {selectedDocument && (
            <DocumentViewer document={selectedDocument} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentList;
