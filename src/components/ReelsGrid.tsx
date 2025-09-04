import { useState, useRef, memo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import LazyImage from "./LazyImage";
import { preloadThumbnails, prefetchThumbnails } from "@/utils/imagePreloader";
import type { Project } from "@/hooks/useProjects";

interface ReelsGridProps {
  projects: Project[];
}

const ReelsGrid = memo(({ projects }: ReelsGridProps) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Preload thumbnails for faster loading
  useEffect(() => {
    if (projects.length > 0) {
      const thumbnailUrls = projects
        .filter(p => p.thumbnail_url)
        .map(p => getThumbnailUrl(p.thumbnail_url!));
      
      // Immediate preloading for first few thumbnails
      preloadThumbnails(thumbnailUrls);
      
      // Progressive prefetching for remaining thumbnails
      setTimeout(() => {
        prefetchThumbnails(thumbnailUrls);
      }, 500);
    }
  }, [projects]);

  const getThumbnailUrl = (thumbnailPath: string): string => {
    if (!thumbnailPath) return '';
    
    // If it's already a full URL, return as is
    if (thumbnailPath.startsWith('http')) {
      return thumbnailPath;
    }
    
    // Generate Supabase Storage URL for thumbnails
    const { data } = supabase.storage.from('thumbnails').getPublicUrl(thumbnailPath);
    return data.publicUrl;
  };

  const getVideoUrl = (url: string): string => {
    console.log('=== Getting video URL for:', url);
    
    // FIRST: Check if it's already a full external URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      console.log('=== EXTERNAL URL detected, returning as-is:', url);
      return url; // STOP HERE - don't process further
    }
    
    // SECOND: Handle YouTube URLs for embedded format
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      console.log('=== YouTube watch URL converted to embed:', embedUrl);
      return embedUrl;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      console.log('=== YouTube short URL converted to embed:', embedUrl);
      return embedUrl;
    }
    
    // THIRD: Handle local Supabase Storage files (filename only)
    const { data } = supabase.storage.from('videos').getPublicUrl(url);
    console.log('=== Local file, generated Supabase storage URL:', data.publicUrl);
    return data.publicUrl;
  };

  const isYouTubeVideo = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">No reels available yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {projects.map((project, index) => (
          <Dialog key={project.id}>
            <DialogTrigger asChild>
              <div className="aspect-[9/16] relative group cursor-pointer overflow-hidden rounded-lg bg-muted">
                {project.thumbnail_url && (
                  <LazyImage
                    src={getThumbnailUrl(project.thumbnail_url)}
                    alt={project.title}
                    fastPreview={true}
                    priority={index < 4}
                    eager={index < 2}
                    className="w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button
                    size="lg"
                    className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30 border border-white/50"
                    onClick={() => setSelectedProject(project)}
                  >
                    <Play className="w-6 h-6 text-white ml-1" />
                  </Button>
                </div>

                {/* Project info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white text-sm font-medium truncate">
                    {project.title}
                  </h3>
                  <p className="text-white/80 text-xs truncate">
                    {project.client}
                  </p>
                </div>
              </div>
            </DialogTrigger>

            <DialogContent className="max-w-md p-0 bg-black">
              <DialogTitle className="sr-only">{project.title}</DialogTitle>
              <div className="aspect-[9/16] relative">
                {project.video_url && (
                  <>
                    {isYouTubeVideo(project.video_url) ? (
                      <iframe
                        src={getVideoUrl(project.video_url)}
                        className="w-full h-full"
                        allowFullScreen
                        title={project.title}
                      />
                    ) : (
                      <video
                        ref={videoRef}
                        src={getVideoUrl(project.video_url)}
                        className="w-full h-full object-cover"
                        controls
                        playsInline
                        preload="metadata"
                        title={project.title}
                        crossOrigin="anonymous"
                        onLoadStart={() => console.log('Video load started')}
                        onLoadedData={() => {
                          console.log('Video data loaded');
                          // Set volume and unmute when data loads
                          if (videoRef.current) {
                            videoRef.current.muted = false;
                            videoRef.current.volume = 1.0;
                          }
                        }}
                        onCanPlay={() => {
                          console.log('Video can play');
                          // Ensure sound is enabled when video can play
                          if (videoRef.current) {
                            videoRef.current.muted = false;
                            videoRef.current.volume = 1.0;
                          }
                        }}
                        onPlay={() => {
                          console.log('Video started playing with sound');
                          // Final check when video actually starts playing
                          if (videoRef.current) {
                            videoRef.current.muted = false;
                            videoRef.current.volume = 1.0;
                          }
                        }}
                        onError={(e) => {
                          console.error('Video failed to load:', e);
                          console.log('Video URL:', getVideoUrl(project.video_url));
                          console.log('Original video_url:', project.video_url);
                        }}
                      />
                    )}
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </>
  );
});

ReelsGrid.displayName = "ReelsGrid";

export default ReelsGrid;