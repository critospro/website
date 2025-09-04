import { useState, useRef, useEffect } from 'react';

interface LazyVideoProps {
  src: string;
  poster: string;
  className?: string;
  onLoadStart?: () => void;
  autoplay?: boolean;
  fastPreview?: boolean;
  eager?: boolean; // Skip intersection observer for above-the-fold content
}

const LazyVideo = ({ src, poster, className, onLoadStart, autoplay = false, fastPreview = true, eager = false }: LazyVideoProps) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPoster, setShowPoster] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (eager) {
      // Skip intersection observer for above-the-fold content
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (fastPreview && autoplay) {
            // Start loading immediately when in view for fast preview
            setShowPoster(false);
          }
          observer.disconnect();
        }
      },
      { rootMargin: fastPreview ? '200px' : '100px' }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, [fastPreview, autoplay, eager]);

  const handleCanPlay = () => {
    setIsLoaded(true);
    onLoadStart?.();
  };

  const handlePlay = () => {
    setShowPoster(false);
  };

  const handleLoadedMetadata = () => {
    if (fastPreview && autoplay && isInView) {
      videoRef.current?.play();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Optimized poster image for fast loading */}
      {showPoster && poster && (
        <div 
          className="absolute inset-0 z-10 cursor-pointer animate-fade-in"
          onClick={handlePlay}
        >
          <img 
            src={poster}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : "auto"}
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center hover-scale">
              <div className="w-0 h-0 border-l-8 border-r-0 border-t-4 border-b-4 border-l-black border-t-transparent border-b-transparent ml-1"></div>
            </div>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        controls={!showPoster}
        preload={fastPreview ? "none" : "metadata"}
        poster={fastPreview ? undefined : poster}
        className="w-full h-full object-cover"
        onCanPlay={handleCanPlay}
        onPlay={handlePlay}
        onLoadedMetadata={handleLoadedMetadata}
        style={{ 
          opacity: isLoaded ? 1 : 0.8,
          transition: 'opacity 0.3s ease',
          display: showPoster ? 'none' : 'block'
        }}
      >
        {isInView && <source src={src} type="video/mp4" />}
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default LazyVideo;