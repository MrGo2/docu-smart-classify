
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

const PromptEditor = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Prompt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Prompt Name</Label>
          <Input id="name" placeholder="Enter prompt name" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe what this prompt does..."
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="promptText">Prompt Text</Label>
          <Textarea
            id="promptText"
            placeholder="Enter your prompt text here..."
            className="font-mono min-h-[200px] bg-muted/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="project">Associated Project</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="project1">Project 1</SelectItem>
              <SelectItem value="project2">Project 2</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Document Types</Label>
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
