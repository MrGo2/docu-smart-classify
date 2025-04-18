
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

const PromptEditor = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Prompt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">Prompt Name *</Label>
          <Input 
            id="name" 
            placeholder="Enter prompt name"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe what this prompt does..."
            className="resize-none min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="promptText" className="text-sm font-medium">Prompt Text *</Label>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-muted/80 border-r flex flex-col text-xs text-muted-foreground select-none">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="px-2 text-center">{i + 1}</div>
              ))}
            </div>
            <Textarea
              id="promptText"
              placeholder="Enter your prompt text here..."
              className="font-mono min-h-[240px] bg-muted/30 pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="project" className="text-sm font-medium">Associated Project</Label>
            <Select>
              <SelectTrigger id="project">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project1">Invoice Processing</SelectItem>
                <SelectItem value="project2">Receipt Analysis</SelectItem>
                <SelectItem value="project3">Contract Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Document Types</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="invoice" />
                <label htmlFor="invoice" className="text-sm font-medium leading-none">
                  Invoice
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="receipt" />
                <label htmlFor="receipt" className="text-sm font-medium leading-none">
                  Receipt
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="contract" />
                <label htmlFor="contract" className="text-sm font-medium leading-none">
                  Contract
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="other" />
                <label htmlFor="other" className="text-sm font-medium leading-none">
                  Other
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline">Cancel</Button>
          <Button>Save Prompt</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptEditor;
