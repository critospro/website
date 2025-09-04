// Preload critical images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Preload multiple images
export const preloadImages = (sources: string[]): Promise<void[]> => {
  return Promise.all(sources.map(preloadImage));
};

// Critical images to preload based on connection
export const CRITICAL_IMAGES = [
  '/src/assets/showreel-hero.jpg',
  '/src/assets/safari-project.jpg',
  '/src/assets/hotel-interior.jpg',
  '/src/assets/experience-project.jpg'
];

// Connection-aware image preloading
export const initImagePreloading = () => {
  if (typeof window !== 'undefined') {
    // Check connection quality
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    const isSlowConnection = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';
    
    if (isSlowConnection || connection?.saveData) {
      // Skip preloading on slow connections
      return;
    }

    // Preload critical images after initial render with progressive loading
    const delay = window.innerWidth < 768 ? 2000 : 1000; // Longer delay on mobile
    
    setTimeout(() => {
      // Preload images one by one to avoid overwhelming the connection
      CRITICAL_IMAGES.reduce((promise, imageSrc) => {
        return promise.then(() => {
          return preloadImage(imageSrc).catch(() => {}); // Ignore errors
        });
      }, Promise.resolve());
    }, delay);
  }
};

// Preload thumbnail images with higher priority
export const preloadThumbnails = (thumbnailUrls: string[]): void => {
  if (typeof window === 'undefined') return;
  
  thumbnailUrls.slice(0, 6).forEach((url, index) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.fetchPriority = index < 3 ? 'high' : 'low'; // First 3 get high priority
    document.head.appendChild(link);
  });
};

// Prefetch remaining thumbnails for smoother scrolling
export const prefetchThumbnails = (thumbnailUrls: string[]): void => {
  if (typeof window === 'undefined') return;
  
  thumbnailUrls.slice(6).forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};