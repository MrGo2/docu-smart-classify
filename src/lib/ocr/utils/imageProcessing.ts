/**
 * Configuration for image processing
 */
const IMAGE_CONFIG = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.9,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'],
  minWidth: 50,
  minHeight: 50,
  maxFileSize: 20 * 1024 * 1024, // 20MB
  processingOptions: {
    contrast: 1.2, // 20% increase
    brightness: 1.1, // 10% increase
    grayscale: true,
    sharpen: true
  }
};

/**
 * Error class for image processing errors
 */
class ImageProcessingError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

/**
 * Converts a File to an HTMLImageElement that can be processed by OCR engines
 */
export const fileToImage = async (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    // Validate file
    if (!file) {
      reject(new ImageProcessingError('No file provided', 'NO_FILE'));
      return;
    }

    if (!IMAGE_CONFIG.allowedTypes.includes(file.type)) {
      reject(new ImageProcessingError(
        `Unsupported image type: ${file.type}. Supported types: ${IMAGE_CONFIG.allowedTypes.join(', ')}`,
        'UNSUPPORTED_TYPE'
      ));
      return;
    }

    if (file.size > IMAGE_CONFIG.maxFileSize) {
      reject(new ImageProcessingError(
        `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (${IMAGE_CONFIG.maxFileSize / 1024 / 1024}MB)`,
        'FILE_TOO_LARGE'
      ));
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    let cleaned = false;

    const cleanup = () => {
      if (!cleaned) {
        URL.revokeObjectURL(url);
        cleaned = true;
      }
    };

    img.onload = () => {
      cleanup();
      console.log(`Image loaded successfully. Original size: ${img.width}x${img.height}`);
      
      // Validate dimensions
      if (img.width < IMAGE_CONFIG.minWidth || img.height < IMAGE_CONFIG.minHeight) {
        reject(new ImageProcessingError(
          `Image dimensions (${img.width}x${img.height}) are too small. Minimum size: ${IMAGE_CONFIG.minWidth}x${IMAGE_CONFIG.minHeight}`,
          'IMAGE_TOO_SMALL'
        ));
        return;
      }
      
      // Process the image
      try {
        const processedCanvas = processImageForOcr(img);
        const processedImage = new Image();
        processedImage.crossOrigin = 'anonymous';
        
        processedImage.onload = () => {
          console.log(`Image processed successfully. Final size: ${processedImage.width}x${processedImage.height}`);
          resolve(processedImage);
        };
        
        processedImage.onerror = () => {
          reject(new ImageProcessingError('Failed to process image', 'PROCESSING_ERROR'));
        };
        
        processedImage.src = processedCanvas.toDataURL('image/jpeg', IMAGE_CONFIG.quality);
      } catch (error) {
        reject(new ImageProcessingError(
          `Failed to process image: ${error.message}`,
          'PROCESSING_ERROR'
        ));
      }
    };
    
    img.onerror = () => {
      cleanup();
      reject(new ImageProcessingError('Failed to load image', 'LOAD_ERROR'));
    };
    
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
};

/**
 * Process image through canvas to normalize it for OCR
 */
const processImageForOcr = (image: HTMLImageElement): HTMLCanvasElement => {
  // Calculate dimensions
  const { width, height } = calculateDimensions(image.width, image.height);
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    throw new ImageProcessingError('Failed to get canvas context', 'CONTEXT_ERROR');
  }
  
  // Fill background with white
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  
  // Draw and process image
  try {
    // Draw original image
    ctx.drawImage(image, 0, 0, width, height);
    
    // Get image data for processing
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Process each pixel
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Convert to grayscale if enabled
      if (IMAGE_CONFIG.processingOptions.grayscale) {
        // Use luminance formula for better grayscale conversion
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        data[i] = data[i + 1] = data[i + 2] = gray;
      }
      
      // Apply contrast
      if (IMAGE_CONFIG.processingOptions.contrast !== 1) {
        const factor = (259 * (IMAGE_CONFIG.processingOptions.contrast * 255 + 255)) / (255 * (259 - IMAGE_CONFIG.processingOptions.contrast * 255));
        data[i] = factor * (data[i] - 128) + 128;
        data[i + 1] = factor * (data[i + 1] - 128) + 128;
        data[i + 2] = factor * (data[i + 2] - 128) + 128;
      }
      
      // Apply brightness
      if (IMAGE_CONFIG.processingOptions.brightness !== 1) {
        data[i] *= IMAGE_CONFIG.processingOptions.brightness;
        data[i + 1] *= IMAGE_CONFIG.processingOptions.brightness;
        data[i + 2] *= IMAGE_CONFIG.processingOptions.brightness;
      }
      
      // Ensure values are within bounds
      data[i] = Math.max(0, Math.min(255, data[i]));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
    }
    
    // Apply sharpening if enabled
    if (IMAGE_CONFIG.processingOptions.sharpen) {
      applySharpening(imageData);
    }
    
    // Put processed image data back
    ctx.putImageData(imageData, 0, 0);
    
    return canvas;
  } catch (error) {
    console.error('Image processing error:', error);
    // If processing fails, return canvas with original image
    ctx.drawImage(image, 0, 0, width, height);
    return canvas;
  }
};

/**
 * Apply sharpening filter to image data
 */
const applySharpening = (imageData: ImageData) => {
  const sharpenKernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];
  
  const { width, height } = imageData;
  const data = imageData.data;
  const output = new Uint8ClampedArray(data);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      for (let c = 0; c < 3; c++) {
        let val = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const kidx = ((y + ky) * width + (x + kx)) * 4;
            val += data[kidx + c] * sharpenKernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        output[idx + c] = Math.max(0, Math.min(255, val));
      }
    }
  }
  
  // Copy sharpened data back
  for (let i = 0; i < data.length; i++) {
    data[i] = output[i];
  }
};

/**
 * Calculate optimal dimensions for OCR processing
 */
const calculateDimensions = (width: number, height: number): { width: number; height: number } => {
  const { maxWidth, maxHeight } = IMAGE_CONFIG;
  
  // If image is within limits, keep original size
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }
  
  // Calculate aspect ratio
  const aspectRatio = width / height;
  
  // Determine which dimension to constrain
  if (width > height) {
    width = maxWidth;
    height = Math.round(width / aspectRatio);
    
    // Check if height still exceeds maximum
    if (height > maxHeight) {
      height = maxHeight;
      width = Math.round(height * aspectRatio);
    }
  } else {
    height = maxHeight;
    width = Math.round(height * aspectRatio);
    
    // Check if width still exceeds maximum
    if (width > maxWidth) {
      width = maxWidth;
      height = Math.round(width / aspectRatio);
    }
  }
  
  return { width, height };
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
