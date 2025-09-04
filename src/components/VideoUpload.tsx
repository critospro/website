import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VideoUploadProps {
  onUploadComplete?: (project: any) => void;
}

const VideoUpload = ({ onUploadComplete }: VideoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    client: "",
    date: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video file must be less than 100MB');
      return;
    }

    // Validate form data
    if (!formData.title.trim() || !formData.client.trim() || !formData.date.trim()) {
      toast.error('Please fill in all project details');
      return;
    }

    setIsUploading(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to upload videos');
        return;
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${formData.title.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;

      // Upload video to storage
      toast.info('Uploading video...');
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Generate thumbnail
      toast.info('Generating thumbnail...');
      const { data: thumbnailData, error: thumbnailError } = await supabase.functions
        .invoke('generate-thumbnail', {
          body: { videoPath: fileName }
        });

      if (thumbnailError) {
        console.warn('Thumbnail generation failed:', thumbnailError);
        // Continue without thumbnail
      }

      // Get video URL
      const { data: { publicUrl: videoUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      // Save project to database
      const { data: project, error: dbError } = await supabase
        .from('projects')
        .insert({
          title: formData.title,
          client: formData.client,
          date: formData.date,
          video_url: videoUrl,
          thumbnail_url: thumbnailData?.thumbnailUrl || null,
          is_video: true,
          user_id: user.id
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      toast.success('Video uploaded successfully!');
      
      // Reset form
      setFormData({ title: "", client: "", date: "" });
      event.target.value = "";
      
      // Notify parent component
      onUploadComplete?.(project);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border">
      <h3 className="text-lg font-medium text-foreground">Upload New Project Video</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Project Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter project title"
            disabled={isUploading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="client">Client</Label>
          <Input
            id="client"
            value={formData.client}
            onChange={(e) => handleInputChange('client', e.target.value)}
            placeholder="Enter client name"
            disabled={isUploading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            disabled={isUploading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="video">Video File</Label>
        <div className="flex items-center gap-4">
          <Input
            id="video"
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="flex-1"
          />
          <Button
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Supported formats: MP4, WebM, QuickTime. Max size: 100MB
        </p>
      </div>
    </div>
  );
};

export default VideoUpload;