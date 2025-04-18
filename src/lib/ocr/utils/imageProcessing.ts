
/**
 * Converts a File to an HTMLImageElement that can be processed by OCR engines
 */
export const fileToImage = async (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }
    
    const url = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      console.log(`Image loaded successfully. Size: ${img.width}x${img.height}`);
      resolve(img);
    };
    
    img.onerror = (error) => {
      URL.revokeObjectURL(url);
      console.error('Failed to load image:', error);
      reject(new Error('Failed to load image'));
    };
    
    // Set crossOrigin to anonymous to avoid CORS issues
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
};

/**
 * Resizes an image if it exceeds maximum dimensions
 * Large images can cause memory issues with OCR
 */
export const resizeImageIfNeeded = (image: HTMLImageElement, maxWidth = 1280, maxHeight = 1280): HTMLCanvasElement => {
  let width = image.width;
  let height = image.height;
  
  // Calculate if resizing is needed
  if (width > maxWidth || height > maxHeight) {
    if (width > height) {
      height = Math.floor(height * (maxWidth / width));
      width = maxWidth;
    } else {
      width = Math.floor(width * (maxHeight / height));
      height = maxHeight;
    }
    
    console.log(`Resizing image to ${width}x${height}`);
  }
  
  // Create canvas for the resized image
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(image, 0, 0, width, height);
  }
  
  return canvas;
};
