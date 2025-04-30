
/**
 * Loads an image with a fallback if the original image fails to load
 * @param imageSrc The primary image source to load
 * @param fallbackSrc The fallback image source if the primary fails
 * @returns Promise that resolves with the usable image source
 */
export const loadImageWithFallback = (imageSrc: string, fallbackSrc: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => resolve(imageSrc);
    
    img.onerror = () => resolve(fallbackSrc);
    
    img.src = imageSrc;
  });
};

/**
 * Check if an image exists at the specified URL
 * @param url The URL to check for an image
 * @returns Promise that resolves to true if the image exists, false otherwise
 */
export const imageExists = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * Get appropriate fallback image based on content type
 * @param type The type of content needing a fallback image
 * @returns Path to the appropriate fallback image
 */
export const getFallbackImage = (type: 'product' | 'member' | 'vehicle' | 'event' = 'product'): string => {
  switch (type) {
    case 'member':
      return '/placeholders/default-member.jpg';
    case 'vehicle':
      return '/placeholders/default-motorcycle.jpg';
    case 'event':
      return '/placeholders/default-event.jpg';
    case 'product':
    default:
      return '/placeholders/default-product.jpg';
  }
};

/**
 * Get URL for local image with path verification
 * @param path Path to the image
 * @param fallbackType Type of fallback to use if image doesn't exist
 * @returns Safe image URL with fallback
 */
export const getSafeImageUrl = async (
  path: string | undefined, 
  fallbackType: 'product' | 'member' | 'vehicle' | 'event' = 'product'
): Promise<string> => {
  if (!path) return getFallbackImage(fallbackType);
  
  // If it's an absolute URL (external image)
  if (path.startsWith('http')) {
    return path;
  }
  
  // For local images, check if they exist
  const exists = await imageExists(path);
  return exists ? path : getFallbackImage(fallbackType);
};
