import { useCallback, useState } from "react";
import { Upload, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FileUploadProps {
  onUpload: (file: File, altText: string) => Promise<void>;
  onCancel: () => void;
  isUploading?: boolean;
}

const FileUpload = ({ onUpload, onCancel, isUploading = false }: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      setSelectedFile(imageFile);
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  const handleUpload = async () => {
    if (selectedFile && altText.trim()) {
      await onUpload(selectedFile, altText.trim());
      // Reset form
      setSelectedFile(null);
      setAltText("");
      setPreviewUrl(null);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setAltText("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Drop your image here</p>
          <p className="text-muted-foreground mb-4">or click to browse</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
          />
          <Button variant="outline" asChild>
            <label htmlFor="file-input" className="cursor-pointer">
              Choose Image
            </label>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative">
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={previewUrl || ""}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={clearSelection}
              className="absolute top-2 right-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Alt Text Input */}
          <div className="space-y-2">
            <Label htmlFor="alt-text">Image Description (Alt Text)</Label>
            <Input
              id="alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe what's in this image..."
              disabled={isUploading}
            />
          </div>

          {/* Upload Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onCancel} disabled={isUploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!altText.trim() || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Photo"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;