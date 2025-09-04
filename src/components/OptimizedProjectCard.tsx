import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Play } from "lucide-react";
import LazyImage from "./LazyImage";

interface OptimizedProjectCardProps {
  title: string;
  client: string;
  date: string;
  image: string;
  isVideo?: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
}

const OptimizedProjectCard = memo(({
  title,
  client,
  date,
  image,
  isVideo = false,
  videoUrl,
  thumbnailUrl
}: OptimizedProjectCardProps) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const getEmbedUrl = (url: string): string => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <div className="group relative overflow-hidden rounded-lg bg-card border border-border hover:shadow-lg transition-all duration-300">
      <div className="aspect-[4/3] relative overflow-hidden">
        <LazyImage
          src={thumbnailUrl || image}
          alt={title}
          fastPreview={true}
          priority={true}
          className="w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        
        {isVideo && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30 border border-white/50"
                >
                  <Play className="w-6 h-6 text-white ml-1" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0 bg-black">
                <DialogTitle className="sr-only">{title}</DialogTitle>
                <div className="aspect-video relative">
                  {videoUrl && (
                    <iframe
                      src={getEmbedUrl(videoUrl)}
                      className="w-full h-full"
                      allowFullScreen
                      title={title}
                      loading="lazy"
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-lg font-normal text-foreground mb-3 line-clamp-2 leading-tight">
          {title}
        </h3>
        <div className="space-y-2">
          <div className="h-px bg-border opacity-60"></div>
          <p className="text-muted-foreground text-sm font-light">
            {client}
          </p>
          <div className="h-px bg-border opacity-60"></div>
          <p className="text-muted-foreground text-xs font-light">
            {date}
          </p>
        </div>
      </div>
    </div>
  );
});

OptimizedProjectCard.displayName = "OptimizedProjectCard";

export default OptimizedProjectCard;