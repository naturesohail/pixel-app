// Get the current domain dynamically
const getDomain = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };
  
  // Handle both relative and absolute URLs
  export const getImageUrl = (url: string): string => {
    if (!url) return '';
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
  
    const cleanPath = url.startsWith('/') ? url.slice(1) : url;
    
    // Combine domain with path
    return `${getDomain()}/${cleanPath}`;
  };