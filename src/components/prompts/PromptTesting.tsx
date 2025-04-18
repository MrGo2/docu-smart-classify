
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "lucide-react";

const PromptTesting = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Prompt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
        >
          <FileUpload className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Drop a file here or click to browse
          </p>
        </div>

        <Button className="w-full">Test Prompt</Button>

        <div className="bg-muted/50 rounded-lg p-4">
          <pre className="text-sm font-mono whitespace-pre-wrap">
            {JSON.stringify({ result: "Test output will appear here" }, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptTesting;
