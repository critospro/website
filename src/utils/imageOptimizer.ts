interface OptimizedImage {
  original: Blob;
  webp: Blob;
  thumbnail: Blob;
  thumbnailWebp: Blob;
}

interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  thumbnailSize?: number;
}

export const optimizeImage = async (
  file: File,
  options: OptimizationOptions = {}
): Promise<OptimizedImage> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    thumbnailSize = 400
  } = options;

  // Create image element
  const img = new Image();
  const imageUrl = URL.createObjectURL(file);
  
  return new Promise((resolve, reject) => {
    img.onload = async () => {
      try {
        URL.revokeObjectURL(imageUrl);
        
        // Calculate optimized dimensions
        const { width: optWidth, height: optHeight } = calculateDimensions(
          img.width, 
          img.height, 
          maxWidth, 
          maxHeight
        );
        
        // Calculate thumbnail dimensions
        const { width: thumbWidth, height: thumbHeight } = calculateDimensions(
          img.width, 
          img.height, 
          thumbnailSize, 
          thumbnailSize
        );

        // Create optimized versions
        const [original, webp, thumbnail, thumbnailWebp] = await Promise.all([
          resizeImage(img, optWidth, optHeight, 'image/jpeg', quality),
          resizeImage(img, optWidth, optHeight, 'image/webp', quality),
          resizeImage(img, thumbWidth, thumbHeight, 'image/jpeg', 0.8),
          resizeImage(img, thumbWidth, thumbHeight, 'image/webp', 0.8)
        ]);

        resolve({
          original,
          webp,
          thumbnail,
          thumbnailWebp
        });
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
};

const calculateDimensions = (
  originalWidth: number, 
  originalHeight: number, 
  maxWidth: number, 
  maxHeight: number
) => {
  let width = originalWidth;
  let height = originalHeight;

  // Calculate aspect ratio
  const aspectRatio = width / height;

  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return { width: Math.round(width), height: Math.round(height) };
};

const resizeImage = (
  img: HTMLImageElement,
  width: number,
  height: number,
  format: string,
  quality: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    canvas.width = width;
    canvas.height = height;

    // Use better image scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw resized image
    ctx.drawImage(img, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      format,
      quality
    );
  });
};

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to create preview'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// Check WebP support
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};