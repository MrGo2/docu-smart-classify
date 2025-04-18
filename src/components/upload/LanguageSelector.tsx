
import { OcrLanguage } from "@/lib/ocr/types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface LanguageSelectorProps {
  value: OcrLanguage;
  onChange: (value: OcrLanguage) => void;
  disabled: boolean;
}

const LanguageSelector = ({ value, onChange, disabled }: LanguageSelectorProps) => {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Label htmlFor="language">OCR Language</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Select "Auto-detect" to automatically identify the document language. 
            Currently supports detection between English and Spanish.</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <Select
        value={value}
        onValueChange={(val) => onChange(val as OcrLanguage)}
        disabled={disabled}
      >
        <SelectTrigger id="language">
          <SelectValue placeholder="Select Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="auto">Auto-detect</SelectItem>
          <SelectItem value="spa">Spanish</SelectItem>
          <SelectItem value="eng">English</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
