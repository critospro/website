import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Palette, Layout, Type, Image, Settings, Save } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useEffect } from "react";

interface SiteBuilderProps {
  userId: string;
  onClose?: () => void;
}

export const SiteBuilder = ({ userId, onClose }: SiteBuilderProps) => {
  const { getTheme, getLayout, updateTheme, updateLayout, isUpdating } = useSiteSettings(userId);
  const [activeTab, setActiveTab] = useState("theme");
  
  const theme = getTheme();
  const layout = getLayout();
  
  const [tempTheme, setTempTheme] = useState(theme);
  const [tempLayout, setTempLayout] = useState(layout);

  useEffect(() => {
    setTempTheme(theme);
    setTempLayout(layout);
  }, [theme, layout]);

  const handleColorChange = (colorKey: string, value: string) => {
    // Convert hex to HSL for our design system
    const hslValue = hexToHsl(value);
    setTempTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: hslValue
      }
    }));
  };

  const saveTheme = () => {
    updateTheme(tempTheme);
    // Apply theme immediately to CSS variables
    applyThemeToCSSVariables(tempTheme);
  };

  const saveLayout = () => {
    updateLayout(tempLayout);
  };

  return (
    <div className="w-full h-full bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-2xl font-bold">Site Builder</h2>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
        <TabsList className="grid w-full grid-cols-5 m-4">
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Media
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <div className="p-4 h-full overflow-y-auto">
          <TabsContent value="theme" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Color Scheme</CardTitle>
                <CardDescription>Customize your site's color palette</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="color"
                        value={hslToHex(tempTheme.colors.primary)}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="w-12 h-8 rounded border"
                      />
                      <Input 
                        value={tempTheme.colors.primary}
                        onChange={(e) => setTempTheme(prev => ({
                          ...prev,
                          colors: { ...prev.colors, primary: e.target.value }
                        }))}
                        placeholder="HSL values"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="color"
                        value={hslToHex(tempTheme.colors.accent)}
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        className="w-12 h-8 rounded border"
                      />
                      <Input 
                        value={tempTheme.colors.accent}
                        onChange={(e) => setTempTheme(prev => ({
                          ...prev,
                          colors: { ...prev.colors, accent: e.target.value }
                        }))}
                        placeholder="HSL values"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="background-color">Background Color</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="color"
                        value={hslToHex(tempTheme.colors.background)}
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        className="w-12 h-8 rounded border"
                      />
                      <Input 
                        value={tempTheme.colors.background}
                        onChange={(e) => setTempTheme(prev => ({
                          ...prev,
                          colors: { ...prev.colors, background: e.target.value }
                        }))}
                        placeholder="HSL values"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input
                    value={tempTheme.siteName}
                    onChange={(e) => setTempTheme(prev => ({ ...prev, siteName: e.target.value }))}
                    placeholder="Enter your site name"
                    className="mt-2"
                  />
                </div>

                <Button onClick={saveTheme} disabled={isUpdating} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Theme
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Layout Settings</CardTitle>
                <CardDescription>Configure your site's layout and structure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Header Style</Label>
                  <Select 
                    value={tempLayout.headerStyle}
                    onValueChange={(value: any) => setTempLayout(prev => ({ ...prev, headerStyle: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="centered">Centered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Grid Columns: {tempLayout.gridColumns}</Label>
                  <Slider
                    value={[tempLayout.gridColumns]}
                    onValueChange={([value]) => setTempLayout(prev => ({ ...prev, gridColumns: value }))}
                    min={1}
                    max={6}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Spacing</Label>
                  <Select 
                    value={tempLayout.spacing}
                    onValueChange={(value: any) => setTempLayout(prev => ({ ...prev, spacing: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tight">Tight</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="loose">Loose</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={saveLayout} disabled={isUpdating} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Layout
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>Manage your site's content and pages</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Page management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Media Management</CardTitle>
                <CardDescription>Upload and manage your site's images and videos</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Media management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Site Settings</CardTitle>
                <CardDescription>Configure general site settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Additional settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

// Helper functions for color conversion
const hexToHsl = (hex: string): string => {
  // Simple hex to HSL conversion - you might want a more robust implementation
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const hslToHex = (hsl: string): string => {
  const [h, s, l] = hsl.split(' ').map((v, i) => {
    if (i === 0) return parseInt(v) / 360;
    return parseInt(v.replace('%', '')) / 100;
  });

  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  
  return `#${f(0)}${f(8)}${f(4)}`;
};

const applyThemeToCSSVariables = (theme: any) => {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value as string);
  });
};