
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DocumentList from "@/components/DocumentList";
import { useState } from "react";

const Documents = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Documents</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
          <CardDescription>
            View and manage your processed documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentList refreshTrigger={refreshTrigger} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Documents;
