import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Photo } from "@/hooks/usePhotos";

interface PhotoEditorProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (photo: Photo) => void;
  onDelete: (id: string) => void;
}

const gridSizeOptions = [
  { value: "col-span-1 row-span-1", label: "Small (1x1)" },
  { value: "col-span-2 row-span-1", label: "Wide (2x1)" },
  { value: "col-span-1 row-span-2", label: "Tall (1x2)" },
  { value: "col-span-2 row-span-2", label: "Large (2x2)" },
  { value: "col-span-3 row-span-1", label: "Extra Wide (3x1)" },
  { value: "col-span-1 row-span-3", label: "Extra Tall (1x3)" },
  { value: "col-span-3 row-span-2", label: "XL Wide (3x2)" },
  { value: "col-span-2 row-span-3", label: "XL Tall (2x3)" },
  { value: "col-span-4 row-span-1", label: "Full Width (4x1)" },
  { value: "col-span-4 row-span-2", label: "Full Wide (4x2)" },
];

const objectFitOptions = [
  { value: "cover", label: "Cover (crop to fill)" },
  { value: "contain", label: "Contain (fit fully)" },
  { value: "fill", label: "Fill (stretch to fit)" },
  { value: "scale-down", label: "Scale Down (smaller of contain/none)" },
  { value: "none", label: "None (original size)" },
];

// Helper function to parse grid class
const parseGridClass = (gridClass: string) => {
  const colMatch = gridClass.match(/col-span-(\d+)/);
  const rowMatch = gridClass.match(/row-span-(\d+)/);
  return {
    width: colMatch ? parseInt(colMatch[1]) : 1,
    height: rowMatch ? parseInt(rowMatch[1]) : 1,
  };
};

// Helper function to create grid class from width/height
const createGridClass = (width: number, height: number) => {
  return `col-span-${width} row-span-${height}`;
};

const PhotoEditor = ({ photo, isOpen, onClose, onSave, onDelete }: PhotoEditorProps) => {
  const [editedPhoto, setEditedPhoto] = useState<Photo | null>(photo);
  const [useSliders, setUseSliders] = useState(false);

  console.log("PhotoEditor render - photo:", photo, "isOpen:", isOpen);

  // Sync editedPhoto with photo prop when it changes
  useEffect(() => {
    console.log("PhotoEditor useEffect - photo changed:", photo);
    setEditedPhoto(photo);
  }, [photo]);

  const currentSize = editedPhoto ? parseGridClass(editedPhoto.grid_class) : { width: 1, height: 1 };

  const handleSizeChange = (width: number, height: number) => {
    const newGridClass = createGridClass(width, height);
    setEditedPhoto(prev => prev ? { ...prev, grid_class: newGridClass } : null);
  };

  const handleSave = () => {
    if (editedPhoto) {
      onSave(editedPhoto);
      onClose();
    }
  };

  const handleDelete = () => {
    if (photo) {
      onDelete(photo.id);
    }
  };

  if (!photo || !editedPhoto) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Photo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={editedPhoto.src}
              alt={editedPhoto.alt}
              className={`w-full h-full object-${editedPhoto.object_fit || 'cover'}`}
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="src">Image URL</Label>
            <Input
              id="src"
              value={editedPhoto.src}
              onChange={(e) =>
                setEditedPhoto(prev => prev ? { ...prev, src: e.target.value } : null)
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Alt Text */}
          <div className="space-y-2">
            <Label htmlFor="alt">Alt Text</Label>
            <Input
              id="alt"
              value={editedPhoto.alt}
              onChange={(e) =>
                setEditedPhoto(prev => prev ? { ...prev, alt: e.target.value } : null)
              }
              placeholder="Describe the image"
            />
          </div>

          {/* Grid Size Control */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Image Size</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUseSliders(!useSliders)}
              >
                {useSliders ? "Presets" : "Custom"}
              </Button>
            </div>

            {useSliders ? (
              <div className="space-y-4">
                {/* Width Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Width: {currentSize.width} columns</Label>
                    <span className="text-sm text-muted-foreground">Max: 6</span>
                  </div>
                  <Slider
                    value={[currentSize.width]}
                    onValueChange={([width]) => handleSizeChange(width, currentSize.height)}
                    max={6}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Height Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Height: {currentSize.height} rows</Label>
                    <span className="text-sm text-muted-foreground">Max: 4</span>
                  </div>
                  <Slider
                    value={[currentSize.height]}
                    onValueChange={([height]) => handleSizeChange(currentSize.width, height)}
                    max={4}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Size Preview */}
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-2">Preview Grid Size:</div>
                  <div className="grid grid-cols-6 gap-1 w-32 h-16">
                    {Array.from({ length: 24 }, (_, i) => {
                      const col = (i % 6) + 1;
                      const row = Math.floor(i / 6) + 1;
                      const isSelected = col <= currentSize.width && row <= currentSize.height;
                      return (
                        <div
                          key={i}
                          className={`aspect-square rounded-sm ${
                            isSelected ? 'bg-primary' : 'bg-muted-foreground/20'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <Select
                value={editedPhoto.grid_class}
                onValueChange={(value) =>
                  setEditedPhoto(prev => prev ? { ...prev, grid_class: value } : null)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grid size" />
                </SelectTrigger>
                <SelectContent>
                  {gridSizeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Image Fit Control */}
          <div className="space-y-2">
            <Label>Image Fit</Label>
            <Select
              value={editedPhoto.object_fit || 'cover'}
              onValueChange={(value: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none') =>
                setEditedPhoto(prev => prev ? { ...prev, object_fit: value } : null)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select how image fits" />
              </SelectTrigger>
              <SelectContent>
                {objectFitOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex justify-between gap-4">
          <Button variant="destructive" onClick={handleDelete} className="mr-auto">
            Delete Photo
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoEditor;