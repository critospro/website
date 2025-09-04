import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LazyImage from "./LazyImage";
import PhotoEditor from "./PhotoEditor";
import MediaSelector from "./MediaSelector";
import { usePhotos, Photo } from "@/hooks/usePhotos";
import { Edit, Plus, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { shouldLoadHighQuality, cleanupUnusedResources } from "@/utils/performanceOptimizer";
import { preloadThumbnails } from "@/utils/imagePreloader";

interface SortablePhotoProps {
  photo: Photo;
  index: number;
  isEditMode: boolean;
  onEdit: (photo: Photo) => void;
  onPreview: (photo: Photo) => void;
}

const SortablePhoto = ({
  photo,
  index,
  isEditMode,
  onEdit,
  onPreview
}: SortablePhotoProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: photo.id
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };
  console.log("SortablePhoto render - photo:", photo.id, "isEditMode:", isEditMode);
  return <div ref={setNodeRef} style={style} className={`group cursor-pointer animate-fade-in ${photo.grid_class} ${isEditMode ? "border-2 border-dashed border-primary/30" : ""}`} {...attributes} {...isEditMode ? listeners : {}}>
      <div className="relative w-full overflow-hidden bg-card shadow-lg hover:shadow-xl transition-all duration-500 group-hover:scale-[1.02]" 
           onClick={() => !isEditMode && onPreview(photo)}>
        <AspectRatio ratio={4/3}>
        <LazyImage 
          src={photo.src} 
          alt={photo.alt} 
          objectFit={photo.object_fit || 'cover'} 
          fastPreview={index === 0} 
          priority={index === 0} 
          eager={index === 0}
          className="w-full h-full transition-transform duration-700 group-hover:scale-105"
          webpSrc={photo.webp_src}
          thumbnailSrc={photo.thumbnail_src}
          thumbnailWebpSrc={photo.thumbnail_webp_src}
        />
        </AspectRatio>
        
        {/* Edit Overlay */}
        {isEditMode && <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
            <Button size="sm" variant="secondary" onClick={e => {
          e.stopPropagation();
          console.log("Photo edit button clicked for photo:", photo.id);
          onEdit(photo);
        }} className="bg-white/90 text-black hover:bg-white shadow-lg">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>}
      </div>
    </div>;
};

const PhotographyGrid = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [showAddPhotoForm, setShowAddPhotoForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const {
    photos,
    loading,
    updatePhoto,
    addPhoto,
    uploadPhoto,
    deletePhoto,
    reorderPhotos
  } = usePhotos();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Preload the first image for better LCP
  useEffect(() => {
    if (photos.length > 0 && photos[0]?.src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = photos[0].src;
      link.fetchPriority = 'high';
      document.head.appendChild(link);
      
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [photos]);

  console.log("PhotographyGrid render - photos:", photos, "loading:", loading, "isEditMode:", isEditMode);
  
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates
  }));
  const handleDragEnd = (event: DragEndEvent) => {
    const {
      active,
      over
    } = event;
    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex(photo => photo.id === active.id);
      const newIndex = photos.findIndex(photo => photo.id === over.id);
      const reorderedPhotos = arrayMove(photos, oldIndex, newIndex);
      reorderPhotos(reorderedPhotos);
    }
  };
  const handlePhotoSave = async (updatedPhoto: Photo) => {
    await updatePhoto(updatedPhoto.id, {
      src: updatedPhoto.src,
      alt: updatedPhoto.alt,
      grid_class: updatedPhoto.grid_class,
      object_fit: updatedPhoto.object_fit
    });
    setEditingPhoto(null);
  };
  const handlePhotoDelete = async (id: string) => {
    const result = await deletePhoto(id);
    setEditingPhoto(null);
  };
  const handleFileUpload = async (file: File, altText: string) => {
    setIsUploading(true);
    try {
      const success = await uploadPhoto(file, altText);
      if (success) {
        setShowAddPhotoForm(false);
      }
    } finally {
      setIsUploading(false);
    }
  };
  const handleStorageSelect = async (fileUrl: string, altText: string) => {
    setIsUploading(true);
    try {
      // Create a photo record with the existing storage URL
      const success = await addPhoto({
        src: fileUrl,
        alt: altText,
        grid_class: "col-span-1 row-span-1",
        grid_position: photos.length,
        object_fit: "cover"
      });
      if (success) {
        setShowAddPhotoForm(false);
      }
    } finally {
      setIsUploading(false);
    }
  };
  if (loading) {
    return <section id="photography" className="py-20 px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-pulse">Loading photos...</div>
          </div>
        </div>
      </section>;
  }
  return <section id="photography" className="mt-24 py-12 px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header with Edit Toggle */}
        <div className="flex justify-between items-center mb-16 animate-fade-in">
          <div className="text-center flex-1">
            
            <div className="text-left max-w-2xl leading-tight tracking-tight">
              <p className="text-lg font-medium text-muted-foreground">Curated Collection of</p>
              <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">Selected Photographs</p>
            </div>
          </div>
          
          {import.meta.env.DEV && (
            <Button variant={isEditMode ? "default" : "outline"} onClick={() => {
              if (!user) {
                // Redirect to auth page or show login prompt
                window.location.href = '/auth';
                return;
              }
              console.log("Edit toggle clicked, current isEditMode:", isEditMode);
              setIsEditMode(!isEditMode);
            }} className="ml-4">
              <Settings className="w-4 h-4 mr-2" />
              {isEditMode ? "Done" : "Edit"}
            </Button>
          )}
        </div>

        {/* Add Photo Form */}
        {isEditMode && showAddPhotoForm && <div className="mb-8 p-6 border border-dashed border-primary/30 rounded-lg bg-card">
            <h3 className="text-lg font-medium mb-4">Add Photo</h3>
            <MediaSelector onUploadFile={handleFileUpload} onSelectFromStorage={handleStorageSelect} onCancel={() => setShowAddPhotoForm(false)} isUploading={isUploading} bucketName="photos" />
          </div>}

        {/* Add Photo Button */}
        {isEditMode && !showAddPhotoForm && <div className="mb-8 text-center">
            <Button variant="outline" onClick={() => setShowAddPhotoForm(true)} className="border-dashed">
              <Plus className="w-4 h-4 mr-2" />
              Add New Photo
            </Button>
          </div>}

        {/* Photo Grid with Drag & Drop - Masonry Layout */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={photos.map(p => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 grid-rows-2 auto-rows-[200px] gap-4 mb-12">
              {photos.map((photo, index) => <SortablePhoto key={photo.id} photo={photo} index={index} isEditMode={isEditMode && !!user} onEdit={setEditingPhoto} onPreview={setPreviewPhoto} />)}
            </div>
          </SortableContext>
        </DndContext>

        {/* See More Button */}
        {!isEditMode && <div className="text-center animate-fade-in">
            <Button variant="outline" size="lg" className="px-8 py-3 border-foreground text-foreground hover:bg-foreground hover:text-background rounded-full font-medium">
              See More Photography
            </Button>
          </div>}

        {/* Photo Editor Modal */}
        <PhotoEditor photo={editingPhoto} isOpen={!!editingPhoto} onClose={() => setEditingPhoto(null)} onSave={handlePhotoSave} onDelete={handlePhotoDelete} />
        
        {/* Image Preview Modal */}
        <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/95">
            {previewPhoto && (
              <div className="relative w-full h-full flex items-center justify-center">
                <picture>
                  {previewPhoto.webp_src && <source srcSet={previewPhoto.webp_src} type="image/webp" />}
                  <img 
                    src={previewPhoto.src} 
                    alt={previewPhoto.alt} 
                    className="max-w-full max-h-[90vh] object-contain"
                  />
                </picture>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>;
};

export default PhotographyGrid;