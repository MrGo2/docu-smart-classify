
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

const BatchUpload = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Batch Upload</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload Multiple Documents</CardTitle>
          <CardDescription>
            Process multiple documents or folders at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Batch upload functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchUpload;
