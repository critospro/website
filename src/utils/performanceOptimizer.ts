// Performance optimization utilities for mobile and desktop

// Critical Resource Prioritization
export const initCriticalResourceHints = () => {
  if (typeof window === 'undefined') return;

  // Prefetch next likely pages
  const prefetchPages = ['/contact', '/reels'];
  
  prefetchPages.forEach(page => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = page;
    document.head.appendChild(link);
  });
};

// Image optimization with WebP support
export const createOptimizedImageUrl = (src: string, width?: number, quality = 80): string => {
  if (!src || src.startsWith('data:')) return src;
  
  // For development, return original
  if (import.meta.env.DEV) return src;
  
  // Add responsive image parameters if width is provided
  if (width) {
    const url = new URL(src, window.location.origin);
    url.searchParams.set('w', width.toString());
    url.searchParams.set('q', quality.toString());
    return url.toString();
  }
  
  return src;
};

// Intersection Observer for lazy loading with mobile optimization
export const createMobileOptimizedObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) => {
  const isMobile = window.innerWidth < 768;
  
  const defaultOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: isMobile ? '100px' : '50px', // Larger margin on mobile for slower connections
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Connection-aware loading
export const getConnectionInfo = () => {
  const nav = navigator as any;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  
  return {
    effectiveType: connection?.effectiveType || '4g',
    downlink: connection?.downlink || 10,
    rtt: connection?.rtt || 100,
    saveData: connection?.saveData || false,
  };
};

// Adaptive loading based on connection
export const shouldLoadHighQuality = (): boolean => {
  const { effectiveType, saveData } = getConnectionInfo();
  
  // Don't load high quality on slow connections or save-data mode
  if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
    return false;
  }
  
  return true;
};

// Memory management for mobile devices
export const cleanupUnusedResources = () => {
  // Cleanup old image URLs to free memory
  const images = document.querySelectorAll('img[data-loaded="true"]');
  images.forEach((img: HTMLImageElement) => {
    if (!img.closest('[data-visible="true"]')) {
      // Optionally clear src for off-screen images on mobile
      if (window.innerWidth < 768 && img.dataset.originalSrc) {
        img.src = img.dataset.placeholder || '';
      }
    }
  });
};

// Touch-optimized interactions
export const addTouchOptimizations = () => {
  // Passive event listeners for better scroll performance
  document.addEventListener('touchstart', () => {}, { passive: true });
  document.addEventListener('touchmove', () => {}, { passive: true });
  
  // Remove 300ms click delay on mobile
  const viewport = document.querySelector('meta[name=viewport]');
  if (viewport) {
    viewport.setAttribute('content', 
      viewport.getAttribute('content') + ', user-scalable=no'
    );
  }
};

// Critical font loading
export const loadCriticalFonts = async () => {
  if (!('fonts' in document)) return;
  
  try {
    // Use a timeout to prevent blocking app initialization
    const fontLoadPromise = new Promise((resolve, reject) => {
      const font = new FontFace(
        'Inter',
        'url(https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.woff2)',
        { weight: '400', display: 'swap' }
      );
      
      font.load().then(() => {
        document.fonts.add(font);
        resolve(font);
      }).catch(reject);
    });

    // Don't wait more than 2 seconds for font loading
    await Promise.race([
      fontLoadPromise,
      new Promise(resolve => setTimeout(resolve, 2000))
    ]);
  } catch (error) {
    // Silently fail - don't block app initialization
    console.debug('Font loading skipped:', error.message);
  }
};

// Mobile-specific optimizations
export const initMobileOptimizations = () => {
  if (window.innerWidth >= 768) return;
  
  // Reduce animation complexity on mobile
  document.documentElement.style.setProperty('--animation-duration', '0.2s');
  
  // Optimize touch targets
  const style = document.createElement('style');
  style.textContent = `
    @media (pointer: coarse) {
      button, [role="button"], input, textarea {
        min-height: 44px;
        min-width: 44px;
      }
    }
  `;
  document.head.appendChild(style);
};

// Performance monitoring
export const measurePerformance = () => {
  if (typeof window === 'undefined') return;
  
  // Measure key metrics
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP:', entry.startTime);
      }
      if (entry.entryType === 'first-input') {
        console.log('FID:', (entry as any).processingStart - entry.startTime);
      }
    });
  });
  
  try {
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
  } catch (e) {
    // Fallback for older browsers
    console.warn('Performance observer not supported');
  }
};