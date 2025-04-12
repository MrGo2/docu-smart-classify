
import React from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { ExtractionStrategy } from "@/lib/extraction/types";

interface ExtractionStrategySelectorProps {
  value: ExtractionStrategy;
  onChange: (value: ExtractionStrategy) => void;
  disabled?: boolean;
}

const ExtractionStrategySelector: React.FC<ExtractionStrategySelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Text Extraction Strategy</label>
      <Select
        value={value}
        onValueChange={(val) => onChange(val as ExtractionStrategy)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select extraction strategy" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ExtractionStrategy.ALL}>
            All Document Text
          </SelectItem>
          <SelectItem value={ExtractionStrategy.FIRST_PAGE}>
            First Page Only
          </SelectItem>
          <SelectItem value={ExtractionStrategy.FIRST_LAST}>
            First & Last Pages
          </SelectItem>
          <SelectItem value={ExtractionStrategy.FIRST_MIDDLE_LAST}>
            First, Middle & Last Pages
          </SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {getStrategyDescription(value)}
      </p>
    </div>
  );
};

function getStrategyDescription(strategy: ExtractionStrategy): string {
  switch (strategy) {
    case ExtractionStrategy.FIRST_PAGE:
      return "Extracts text only from the first page for classification";
    case ExtractionStrategy.FIRST_LAST:
      return "Extracts text from both first and last pages for classification";
    case ExtractionStrategy.FIRST_MIDDLE_LAST:
      return "Extracts text from first, middle, and last pages for classification";
    case ExtractionStrategy.ALL:
    default:
      return "Extracts all document text for classification (may be limited for large documents)";
  }
}

export default ExtractionStrategySelector;
