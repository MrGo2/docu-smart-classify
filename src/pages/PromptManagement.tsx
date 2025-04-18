
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PromptList from "@/components/prompts/PromptList";
import PromptEditor from "@/components/prompts/PromptEditor";
import PromptGeneration from "@/components/prompts/PromptGeneration";

const PromptManagement = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Prompt Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <PromptList />
        </div>
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="editor">Prompt Editor</TabsTrigger>
              <TabsTrigger value="generation">Prompt Generation</TabsTrigger>
            </TabsList>
            <TabsContent value="editor">
              <PromptEditor />
            </TabsContent>
            <TabsContent value="generation">
              <PromptGeneration />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PromptManagement;
