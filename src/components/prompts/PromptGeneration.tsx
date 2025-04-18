
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, FileType, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const PromptGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  
  // Mock function to simulate prompt generation
  const handleGeneratePrompt = () => {
    setIsGenerating(true);
    // Simulate API call with a timeout
    setTimeout(() => {
      setGeneratedPrompt(
        `Extract the following fields from {{document_type}}:\n\n1. Invoice Number\n2. Date\n3. Total Amount\n4. Tax Amount\n5. Vendor Name\n6. Vendor Address\n\nFor each field, provide the extracted value and confidence score.`
      );
      setIsGenerating(false);
    }, 2000);
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Prompt</CardTitle>
        <CardDescription>
          Upload a sample document to generate an optimized extraction prompt
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label 
            htmlFor="file-upload"
            className="block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
          >
            {fileName ? (
              <div className="flex flex-col items-center">
                <FileType className="mx-auto h-8 w-8 text-primary" />
                <p className="mt-2 text-sm font-medium">{fileName}</p>
                <p className="text-xs text-muted-foreground">Click to change file</p>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload a sample document or image
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supported formats: PDF, JPEG, PNG
                </p>
              </>
            )}
          </label>
          <input 
            id="file-upload" 
            type="file" 
            className="hidden" 
            onChange={handleFileUpload}
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>

        <Button 
          className="w-full" 
          onClick={handleGeneratePrompt}
          disabled={!fileName || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Prompt...
            </>
          ) : (
            "Generate Prompt"
          )}
        </Button>

        {generatedPrompt && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Generated Prompt</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <Textarea 
                value={generatedPrompt}
                className="font-mono min-h-[200px] bg-transparent border-none focus-visible:ring-0 resize-none"
                readOnly
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setGeneratedPrompt("")}>
                Clear
              </Button>
              <Button size="sm" onClick={() => {/* Copy to editor logic */}}>
                Use in Editor
              </Button>
            </div>
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg text-sm">
          <h4 className="font-medium mb-2">How Prompt Generation Works</h4>
          <p className="text-muted-foreground">
            Our AI analyzes your document to identify key elements and structure, then creates
            an optimized prompt for data extraction. For best results, upload high-quality
            samples that represent your document type.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptGeneration;
