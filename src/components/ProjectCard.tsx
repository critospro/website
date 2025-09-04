import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface ProjectCardProps {
  title: string;
  client: string;
  date: string;
  image: string;
  isVideo?: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
}

const ProjectCard = ({ title, client, date, image, isVideo = false, videoUrl, thumbnailUrl }: ProjectCardProps) => {
  // Convert YouTube URL to embed format with minimal branding
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&controls=1`;
    }
    // For uploaded videos, return the direct URL
    return url;
  };

  return (
    <div className="group cursor-pointer animate-slide-up">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-card mb-6 shadow-lg">
        <img 
          src={thumbnailUrl || image} 
          alt={title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
        />
        
        {/* Hover overlay exactly like Sam Kolder */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          {isVideo && videoUrl && (
            <Dialog>
              <DialogTrigger asChild>
                <button className="w-16 h-16 rounded-full bg-foreground/10 backdrop-blur-sm border border-foreground flex items-center justify-center transition-all duration-300 group-hover:scale-110 hover:bg-foreground/20">
                  <div className="w-0 h-0 border-l-[12px] border-l-foreground border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-full p-0 bg-black/95">
                <div className="aspect-video w-full">
                  {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={getEmbedUrl(videoUrl)}
                      title={title}
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={videoUrl}
                      title={title}
                      className="w-full h-full rounded-lg"
                      controls
                      autoPlay
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-normal text-foreground mb-3 line-clamp-2 leading-tight">{title}</h3>
        <div className="space-y-2">
          <div className="h-px bg-foreground/20"></div>
          <p className="text-muted-foreground text-sm font-light">{client}</p>
          <div className="h-px bg-foreground/20"></div>
          <p className="text-muted-foreground text-xs font-light">{date}</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;