
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronUp, ChevronDown, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PromptList = () => {
  // Sample data - would be replaced with actual data in a real implementation
  const [prompts, setPrompts] = useState([
    {
      id: 1,
      name: "Extract Invoice Data",
      description: "Extracts key fields from invoice documents",
      documentType: "Invoice",
      created: "2024-04-15",
      modified: "2024-04-18"
    },
    {
      id: 2,
      name: "Analyze Receipt",
      description: "Processes receipt images for expense reporting",
      documentType: "Receipt",
      created: "2024-04-10",
      modified: "2024-04-16"
    }
  ]);
  
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>('all');
  
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Filter prompts based on document type
  const filteredPrompts = documentTypeFilter === 'all' 
    ? prompts 
    : prompts.filter(prompt => prompt.documentType.toLowerCase() === documentTypeFilter.toLowerCase());
  
  // Sort prompts if a sort field is selected
  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    if (!sortField) return 0;
    
    const fieldA = a[sortField as keyof typeof a];
    const fieldB = b[sortField as keyof typeof b];
    
    if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="border rounded-lg flex flex-col h-full max-h-[700px]">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Prompts</h2>
        <div className="flex space-x-2 mt-2">
          <Input 
            placeholder="Search prompts..." 
            className="h-8" 
          />
          <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
            <SelectTrigger className="w-auto h-8">
              <Filter className="h-4 w-4 mr-1" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="receipt">Receipt</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="overflow-auto flex-grow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => toggleSort('name')}
              >
                Prompt Name
                {sortField === 'name' && (
                  sortDirection === 'asc' ? 
                    <ChevronUp className="h-4 w-4 inline ml-1" /> : 
                    <ChevronDown className="h-4 w-4 inline ml-1" />
                )}
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => toggleSort('created')}
              >
                Created
                {sortField === 'created' && (
                  sortDirection === 'asc' ? 
                    <ChevronUp className="h-4 w-4 inline ml-1" /> : 
                    <ChevronDown className="h-4 w-4 inline ml-1" />
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => toggleSort('modified')}
              >
                Modified
                {sortField === 'modified' && (
                  sortDirection === 'asc' ? 
                    <ChevronUp className="h-4 w-4 inline ml-1" /> : 
                    <ChevronDown className="h-4 w-4 inline ml-1" />
                )}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPrompts.length > 0 ? (
              sortedPrompts.map((prompt) => (
                <TableRow key={prompt.id}>
                  <TableCell className="font-medium">{prompt.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{prompt.description}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {prompt.documentType}
                    </span>
                  </TableCell>
                  <TableCell>{prompt.created}</TableCell>
                  <TableCell>{prompt.modified}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No prompts found. Create your first prompt using the editor.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PromptList;
