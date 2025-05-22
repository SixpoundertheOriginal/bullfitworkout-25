
/**
 * Utilities for enhancing iOS user experience and device adaptation
 */

// Detect if device is running iOS
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

// Detect if app is running in standalone mode (installed to home screen)
export const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    ('standalone' in window.navigator) && 
    (window.navigator as any).standalone === true
  );
};

// Get iOS version number
export const getIOSVersion = (): number | null => {
  if (!isIOS()) return null;
  
  const match = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
  return match ? parseInt(match[1], 10) : null;
};

// Get safe area insets
export const getSafeAreaInsets = (): { top: number; right: number; bottom: number; left: number } => {
  // Default fallback values
  const defaults = { top: 44, right: 0, bottom: 34, left: 0 };
  
  // Try to get CSS environment variables if supported
  if (typeof window !== 'undefined' && window.CSS && window.CSS.supports) {
    if (window.CSS.supports('padding-top: env(safe-area-inset-top)')) {
      // Get computed styles of a temporary element with safe area insets
      const div = document.createElement('div');
      div.style.paddingTop = 'env(safe-area-inset-top)';
      div.style.paddingRight = 'env(safe-area-inset-right)';
      div.style.paddingBottom = 'env(safe-area-inset-bottom)';
      div.style.paddingLeft = 'env(safe-area-inset-left)';
      document.body.appendChild(div);
      
      const computedStyle = window.getComputedStyle(div);
      const top = parseInt(computedStyle.paddingTop) || defaults.top;
      const right = parseInt(computedStyle.paddingRight) || defaults.right;
      const bottom = parseInt(computedStyle.paddingBottom) || defaults.bottom;
      const left = parseInt(computedStyle.paddingLeft) || defaults.left;
      
      document.body.removeChild(div);
      
      return { top, right, bottom, left };
    }
  }
  
  return defaults;
};

// Apply iOS-style momentum scrolling to an element
export const applyIOSScrolling = (element: HTMLElement): void => {
  // Use standard properties instead of vendor-prefixed ones
  // TypeScript doesn't recognize WebkitOverflowScrolling as a valid CSS property
  (element.style as any).WebkitOverflowScrolling = 'touch';
  element.style.overscrollBehavior = 'none';
  element.style.overflowY = 'auto';
};

// Generate spring animation properties based on iOS standards
export const getIOSSpringAnimation = (
  damping = 'medium'
): { stiffness: number; damping: number; mass: number } => {
  // iOS-style spring animations with different damping levels
  const springPresets: Record<string, { stiffness: number; damping: number; mass: number }> = {
    light: { stiffness: 300, damping: 20, mass: 1 },
    medium: { stiffness: 400, damping: 28, mass: 1 },
    heavy: { stiffness: 500, damping: 36, mass: 1 },
  };
  
  return springPresets[damping] || springPresets.medium;
};

// Format duration in iOS style (e.g., "1m 30s" instead of "1:30")
export const formatIOSDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  let result = '';
  
  if (hours > 0) {
    result += `${hours}h `;
  }
  
  if (minutes > 0 || hours > 0) {
    result += `${minutes}m `;
  }
  
  if (remainingSeconds > 0 || (hours === 0 && minutes === 0)) {
    result += `${remainingSeconds}s`;
  }
  
  return result.trim();
};

// Add iOS system font to Tailwind configuration
export const getIOSSystemFont = (): string => {
  return "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji'";
};

// Convert rem to px for consistent scaling on iOS
export const remToPx = (rem: number): number => {
  if (typeof window === 'undefined') return rem * 16; // Default assumption
  const fontSize = window.getComputedStyle(document.documentElement).fontSize;
  return rem * parseFloat(fontSize);
};

// Enable double-tap to zoom prevention
export const preventDoubleTapZoom = (): void => {
  const META_VIEWPORT = document.querySelector('meta[name="viewport"]');
  if (META_VIEWPORT) {
    META_VIEWPORT.setAttribute('content', 
      'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
    );
  }
};

// Enable proper viewport height on iOS (addressing the 100vh issue)
export const fixIOSViewportHeight = (): void => {
  if (!isIOS()) return;
  
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);
  setVH();
};

// Export a function to handle all iOS-specific adjustments at once
export const applyIOSEnhancements = (): void => {
  if (!isIOS()) return;
  
  fixIOSViewportHeight();
  
  // Apply momentum scrolling to main content areas
  const contentElements = document.querySelectorAll('.scroll-container');
  contentElements.forEach(el => {
    if (el instanceof HTMLElement) {
      applyIOSScrolling(el);
    }
  });
  
  // Add touch action manipulation to interactive elements
  const buttons = document.querySelectorAll('button, [role="button"]');
  buttons.forEach(button => {
    if (button instanceof HTMLElement) {
      button.style.touchAction = 'manipulation';
    }
  });
  
  // Prevent the 300ms tap delay
  const touchDelay = document.createElement('script');
  touchDelay.innerHTML = `
    document.addEventListener('touchend', function(event) {
      if (event.target.tagName === 'A' || event.target.tagName === 'BUTTON') {
        event.preventDefault();
      }
    }, false);
  `;
  document.head.appendChild(touchDelay);
};

export default {
  isIOS,
  isStandalone,
  getIOSVersion,
  getSafeAreaInsets,
  applyIOSScrolling,
  getIOSSpringAnimation,
  formatIOSDuration,
  getIOSSystemFont,
  remToPx,
  preventDoubleTapZoom,
  fixIOSViewportHeight,
  applyIOSEnhancements
};
