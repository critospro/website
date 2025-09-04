import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { optimizeImage } from "@/utils/imageOptimizer";

export interface Photo {
  id: string;
  src: string;
  alt: string;
  grid_position: number;
  grid_class: string;
  object_fit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  user_id?: string;
  webp_src?: string;
  thumbnail_src?: string;
  thumbnail_webp_src?: string;
}

export const usePhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .order("grid_position");

      if (error) {
        console.error("Error fetching photos:", error);
        toast({
          title: "Error",
          description: "Failed to load photos",
          variant: "destructive",
        });
        return;
      }

      // Type cast the object_fit field to ensure type safety
      const typedPhotos = (data || []).map(photo => ({
        ...photo,
        object_fit: (photo.object_fit as 'cover' | 'contain' | 'fill' | 'scale-down' | 'none') || 'cover'
      }));

      setPhotos(typedPhotos);
    } catch (error) {
      console.error("Error fetching photos:", error);
      toast({
        title: "Error", 
        description: "Failed to load photos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePhoto = async (id: string, updates: Partial<Photo>) => {
    try {
      const { error } = await supabase
        .from("photos")
        .update(updates)
        .eq("id", id);

      if (error) {
        console.error("Error updating photo:", error);
        toast({
          title: "Error",
          description: "Failed to update photo",
          variant: "destructive",
        });
        return false;
      }

      setPhotos(prev => 
        prev.map(photo => 
          photo.id === id ? { ...photo, ...updates } : photo
        )
      );

      toast({
        title: "Success",
        description: "Photo updated successfully",
      });
      return true;
    } catch (error) {
      console.error("Error updating photo:", error);
      toast({
        title: "Error",
        description: "Failed to update photo", 
        variant: "destructive",
      });
      return false;
    }
  };

  const addPhoto = async (photoData: Omit<Photo, "id">) => {
    try {
      const { data, error } = await supabase
        .from("photos")
        .insert([photoData])
        .select()
        .single();

      if (error) {
        console.error("Error adding photo:", error);
        toast({
          title: "Error",
          description: "Failed to add photo",
          variant: "destructive",
        });
        return false;
      }

      // Type cast the object_fit field to ensure type safety
      const typedPhoto = {
        ...data,
        object_fit: (data.object_fit as 'cover' | 'contain' | 'fill' | 'scale-down' | 'none') || 'cover'
      };

      setPhotos(prev => [...prev, typedPhoto]);
      toast({
        title: "Success",
        description: "Photo added successfully",
      });
      return true;
    } catch (error) {
      console.error("Error adding photo:", error);
      toast({
        title: "Error",
        description: "Failed to add photo",
        variant: "destructive",
      });
      return false;
    }
  };

  const deletePhoto = async (id: string) => {
    try {
      // First get the photo to find the file path
      const photoToDelete = photos.find(p => p.id === id);
      
      // Delete from database
      const { error } = await supabase
        .from("photos")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("Error deleting photo:", error);
        toast({
          title: "Error",
          description: "Failed to delete photo",
          variant: "destructive",
        });
        return false;
      }

      // If photo has a storage URL, delete the file from storage
      if (photoToDelete?.src && photoToDelete.src.includes('supabase')) {
        try {
          // Extract filename from URL
          const url = new URL(photoToDelete.src);
          const pathParts = url.pathname.split('/');
          const fileName = pathParts[pathParts.length - 1];
          
          // Delete from storage (don't fail if storage delete fails)
          const { error: storageError } = await supabase.storage
            .from('photos')
            .remove([fileName]);
        } catch (storageError) {
          console.warn("Failed to delete file from storage:", storageError);
          // Don't fail the whole operation if storage cleanup fails
        }
      }

      setPhotos(prev => prev.filter(photo => photo.id !== id));
      toast({
        title: "Success",
        description: "Photo deleted successfully",
      });
      return true;
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive",
      });
      return false;
    }
  };

  const reorderPhotos = async (reorderedPhotos: Photo[]) => {
    try {
      // Update each photo's position individually
      const updatePromises = reorderedPhotos.map((photo, index) =>
        supabase
          .from("photos")
          .update({ grid_position: index })
          .eq("id", photo.id)
      );

      const results = await Promise.all(updatePromises);
      
      // Check if any updates failed
      const hasError = results.some(result => result.error);
      if (hasError) {
        console.error("Error reordering photos");
        toast({
          title: "Error",
          description: "Failed to reorder photos",
          variant: "destructive",
        });
        return false;
      }

      setPhotos(reorderedPhotos.map((photo, index) => ({
        ...photo,
        grid_position: index,
      })));

      toast({
        title: "Success",
        description: "Photos reordered successfully",
      });
      return true;
    } catch (error) {
      console.error("Error reordering photos:", error);
      toast({
        title: "Error",
        description: "Failed to reorder photos",
        variant: "destructive",
      });
      return false;
    }
  };

  const uploadPhoto = async (file: File, altText: string) => {
    try {
      toast({
        title: "Processing",
        description: "Optimizing image...",
      });

      // Optimize the image
      const optimizedImages = await optimizeImage(file);
      
      // Generate unique base filename
      const baseName = `${Math.random().toString(36).substring(2)}-${Date.now()}`;
      
      // Upload all versions to storage
      const uploads = [
        { blob: optimizedImages.original, suffix: '.jpg', key: 'src' },
        { blob: optimizedImages.webp, suffix: '.webp', key: 'webp_src' },
        { blob: optimizedImages.thumbnail, suffix: '_thumb.jpg', key: 'thumbnail_src' },
        { blob: optimizedImages.thumbnailWebp, suffix: '_thumb.webp', key: 'thumbnail_webp_src' }
      ];

      const uploadResults: { [key: string]: string } = {};

      for (const upload of uploads) {
        const fileName = `${baseName}${upload.suffix}`;
        
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, upload.blob);

        if (uploadError) {
          console.error(`Error uploading ${upload.key}:`, uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data } = supabase.storage
          .from('photos')
          .getPublicUrl(fileName);
        
        uploadResults[upload.key] = data.publicUrl;
      }

      // Add photo record to database with all optimized versions
      const success = await addPhoto({
        src: uploadResults.src,
        webp_src: uploadResults.webp_src,
        thumbnail_src: uploadResults.thumbnail_src,
        thumbnail_webp_src: uploadResults.thumbnail_webp_src,
        alt: altText,
        grid_position: photos.length,
        grid_class: "col-span-1 row-span-1",
      });

      if (success) {
        toast({
          title: "Success", 
          description: "Photo uploaded and optimized successfully",
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error in uploadPhoto:", error);
      toast({
        title: "Error",
        description: "Failed to upload photo",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  return {
    photos,
    loading,
    updatePhoto,
    addPhoto,
    uploadPhoto,
    deletePhoto,
    reorderPhotos,
    refetch: fetchPhotos,
  };
};