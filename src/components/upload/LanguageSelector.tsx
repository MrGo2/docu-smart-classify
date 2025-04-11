
import { OcrLanguage } from "@/lib/ocr/types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSelectorProps {
  value: OcrLanguage;
  onChange: (value: OcrLanguage) => void;
  disabled: boolean;
}

const LanguageSelector = ({ value, onChange, disabled }: LanguageSelectorProps) => {
  return (
    <div className="mb-4">
      <Label htmlFor="language">OCR Language</Label>
      <Select
        value={value}
        onValueChange={(val) => onChange(val as OcrLanguage)}
        disabled={disabled}
      >
        <SelectTrigger id="language">
          <SelectValue placeholder="Select Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="spa">Spanish</SelectItem>
          <SelectItem value="eng">English</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
