import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Palette, Layout, Type, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface QuickCustomizerProps {
  userId?: string;
}

export const QuickCustomizer = ({ userId }: QuickCustomizerProps) => {
  const { getTheme, updateTheme, isUpdating } = useSiteSettings(userId);
  const [open, setOpen] = useState(false);
  
  const theme = getTheme();

  const presetColors = [
    { name: "Cinematic Dark", primary: "0 0% 98%", accent: "180 100% 35%", background: "0 0% 4%" },
    { name: "Ocean Blue", primary: "210 100% 90%", accent: "200 100% 50%", background: "220 15% 8%" },
    { name: "Forest Green", primary: "120 60% 90%", accent: "140 100% 40%", background: "120 10% 5%" },
    { name: "Sunset Orange", primary: "30 100% 95%", accent: "25 100% 55%", background: "15 20% 6%" },
  ];

  const applyPreset = (preset: any) => {
    updateTheme({
      ...theme,
      colors: {
        ...theme.colors,
        primary: preset.primary,
        accent: preset.accent,
        background: preset.background,
      }
    });
  };

  if (!userId) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="fixed bottom-4 right-4 z-50 shadow-lg"
        >
          <Palette className="w-4 h-4 mr-2" />
          Quick Customize
        </Button>
      </SheetTrigger>
      <SheetContent className="w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Quick Customizer</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          <div>
            <Label className="text-base font-medium">Color Presets</Label>
            <div className="grid grid-cols-1 gap-2 mt-3">
              {presetColors.map((preset, index) => (
                <Card key={index} className="cursor-pointer hover:bg-accent transition-colors" onClick={() => applyPreset(preset)}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{preset.name}</span>
                      <div className="flex gap-1">
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: `hsl(${preset.primary})` }}
                        />
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: `hsl(${preset.accent})` }}
                        />
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: `hsl(${preset.background})` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-medium">Site Name</Label>
            <Input
              value={theme.siteName}
              onChange={(e) => updateTheme({ ...theme, siteName: e.target.value })}
              placeholder="Enter site name"
              className="mt-2"
            />
          </div>

          <div className="pt-4 border-t">
            <Button 
              onClick={() => setOpen(false)}
              className="w-full"
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Done"}
            </Button>
          </div>

          <div className="text-center">
            <Button 
              variant="link" 
              size="sm"
              onClick={() => {
                setOpen(false);
                window.open('/site-builder', '_blank');
              }}
            >
              Open Full Site Builder →
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};