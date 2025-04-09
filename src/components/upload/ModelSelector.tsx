
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

const ModelSelector = ({ value, onChange, disabled }: ModelSelectorProps) => {
  return (
    <div className="mb-4">
      <Label htmlFor="model">AI Model for Classification</Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger id="model">
          <SelectValue placeholder="Select Model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="openai">OpenAI</SelectItem>
          <SelectItem value="mistral">Mistral</SelectItem>
          <SelectItem value="claude">Claude</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ModelSelector;
