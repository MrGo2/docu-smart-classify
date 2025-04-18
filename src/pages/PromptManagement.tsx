
import PromptList from "@/components/prompts/PromptList";
import PromptEditor from "@/components/prompts/PromptEditor";
import PromptTesting from "@/components/prompts/PromptTesting";

const PromptManagement = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Prompt Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <PromptList />
        </div>
        <div className="lg:col-span-8 space-y-6">
          <PromptEditor />
          <PromptTesting />
        </div>
      </div>
    </div>
  );
};

export default PromptManagement;
