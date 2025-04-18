
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OcrFactory } from "@/lib/ocr/OcrFactory";
import { OcrLanguage } from "@/lib/ocr/types";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";

const OcrSettings = () => {
  const [provider, setProvider] = useState<string>("paddleocr");
  const [defaultLanguage, setDefaultLanguage] = useState<OcrLanguage>("auto");
  const [enableGpu, setEnableGpu] = useState<boolean>(false);
  const [highQuality, setHighQuality] = useState<boolean>(true);
  const [qualityLevel, setQualityLevel] = useState<number>(75);

  const handleSaveSettings = () => {
    // In a real implementation, these settings would be saved to local storage or a database
    localStorage.setItem("ocr.provider", provider);
    localStorage.setItem("ocr.defaultLanguage", defaultLanguage);
    localStorage.setItem("ocr.enableGpu", String(enableGpu));
    localStorage.setItem("ocr.highQuality", String(highQuality));
    localStorage.setItem("ocr.qualityLevel", String(qualityLevel));
    
    toast({
      title: "OCR Settings Saved",
      description: "Your OCR processing settings have been updated"
    });
  };
  
  const handleTestOcr = () => {
    // In a real implementation, this would test the OCR configuration
    toast({
      title: "OCR Test Started",
      description: "Testing OCR configuration with selected settings"
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>OCR Settings</CardTitle>
        <CardDescription>
          Configure Optical Character Recognition processing options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="ocr-provider">OCR Provider</Label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger id="ocr-provider">
              <SelectValue placeholder="Select OCR provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paddleocr">PaddleOCR (Recommended)</SelectItem>
              <SelectItem value="tesseract">Tesseract</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            PaddleOCR offers better accuracy and performance than Tesseract
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="default-language">Default Language</Label>
          <Select value={defaultLanguage} onValueChange={(val) => setDefaultLanguage(val as OcrLanguage)}>
            <SelectTrigger id="default-language">
              <SelectValue placeholder="Select default language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-detect (Recommended)</SelectItem>
              <SelectItem value="spa">Spanish</SelectItem>
              <SelectItem value="eng">English</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Auto-detect will automatically identify the document language
          </p>
        </div>

        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Advanced Settings</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-gpu" className="text-sm font-medium">
                Enable GPU Acceleration
              </Label>
              <p className="text-xs text-muted-foreground">
                Uses GPU for faster processing if available
              </p>
            </div>
            <Switch
              id="enable-gpu"
              checked={enableGpu}
              onCheckedChange={setEnableGpu}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="high-quality" className="text-sm font-medium">
                High Quality Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                Better accuracy but slower processing
              </p>
            </div>
            <Switch
              id="high-quality"
              checked={highQuality}
              onCheckedChange={setHighQuality}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="quality-level" className="text-sm font-medium">
                Quality vs. Speed
              </Label>
              <span className="text-sm text-muted-foreground">
                {qualityLevel}%
              </span>
            </div>
            <TooltipProvider>
              <Slider
                id="quality-level"
                min={0}
                max={100}
                step={5}
                value={[qualityLevel]}
                onValueChange={(values) => setQualityLevel(values[0])}
              />
            </TooltipProvider>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Faster</span>
              <span>More Accurate</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleTestOcr}>
            Test OCR
          </Button>
          <Button onClick={handleSaveSettings}>
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OcrSettings;
