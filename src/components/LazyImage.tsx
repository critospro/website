import { useState, useRef, useEffect, memo } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean; // Add priority loading for above-the-fold images
  eager?: boolean; // Skip lazy loading for critical images
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none'; // Add object-fit control
  fastPreview?: boolean; // Enable fast preview loading
  webpSrc?: string; // WebP version for modern browsers
  thumbnailSrc?: string; // Thumbnail for fast preview
  thumbnailWebpSrc?: string; // WebP thumbnail
}

const LazyImage = memo(({ 
  src, 
  alt, 
  className, 
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3C/svg%3E",
  onLoad,
  onError,
  priority = false,
  eager = false,
  objectFit = 'cover',
  fastPreview = true,
  webpSrc,
  thumbnailSrc,
  thumbnailWebpSrc
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(eager || fastPreview); // Load immediately if eager or fast preview
  const [hasError, setHasError] = useState(false);
  const [showPreview, setShowPreview] = useState(fastPreview);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Skip intersection observer if eager loading or fast preview
    if (eager || fastPreview) return;

    // Connection-aware and mobile-optimized preloading
    const isMobile = window.innerWidth < 768;
    const connection = (navigator as any).connection;
    const isSlowConnection = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g' || connection?.saveData;
    
    // Adjust margins based on device and connection
    let rootMargin = '200px';
    if (isMobile) {
      rootMargin = isSlowConnection ? '100px' : '400px'; // More aggressive on mobile with good connection
    }
    if (fastPreview) {
      rootMargin = isMobile ? '500px' : '300px'; // Even more aggressive for fast preview
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0,
        rootMargin
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [eager, fastPreview]);

  // Preload high priority images
  useEffect(() => {
    if (priority && src && !hasError) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = src;
      document.head.appendChild(preloadLink);
      
      return () => {
        if (document.head.contains(preloadLink)) {
          document.head.removeChild(preloadLink);
        }
      };
    }
  }, [priority, src, hasError]);

  const handleLoad = () => {
    setIsLoaded(true);
    setShowPreview(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Fast loading placeholder with blur effect */}
      {showPreview && fastPreview && !hasError && (
        <div
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-muted via-muted/80 to-muted/60 animate-pulse transition-all duration-300"
          style={{
            backdropFilter: 'blur(20px)',
            backgroundImage: `linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%), 
                             linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%), 
                             linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%), 
                             linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)`,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Standard placeholder for non-fast preview */}
      {!isLoaded && !hasError && !fastPreview && (
        <div
          className={`absolute inset-0 w-full h-full bg-muted animate-pulse transition-opacity duration-200 ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          aria-hidden="true"
        />
      )}
      
      {/* Thumbnail preview for fast initial load */}
      {showPreview && fastPreview && !hasError && (thumbnailSrc || thumbnailWebpSrc) && (
        <picture className="absolute inset-0 w-full h-full">
          {thumbnailWebpSrc && <source srcSet={thumbnailWebpSrc} type="image/webp" />}
          {thumbnailSrc && (
            <img
              src={thumbnailSrc}
              alt=""
              className={`w-full h-full object-${objectFit} opacity-60 blur-sm scale-105 transition-all duration-300`}
              loading="eager"
              decoding="async"
              aria-hidden="true"
            />
          )}
        </picture>
      )}
      
      {/* Actual optimized image with WebP support */}
      {isInView && !hasError && (
        <picture className="w-full h-full">
          {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
          <img
            src={src}
            alt={alt}
            className={`w-full h-full object-${objectFit} transition-all duration-500 ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            } ${fastPreview ? 'animate-fade-in' : ''}`}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority || fastPreview ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority || fastPreview ? "high" : "auto"}
            // Add explicit dimensions for better layout stability
            style={{ 
              contentVisibility: 'auto',
              containIntrinsicSize: '1px 1000px',
              filter: isLoaded ? 'none' : 'blur(5px)',
              transform: isLoaded ? 'scale(1)' : 'scale(1.05)'
            }}
          />
        </picture>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
          <span className="text-sm">⚠ Image failed to load</span>
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = "LazyImage";

export default LazyImage;