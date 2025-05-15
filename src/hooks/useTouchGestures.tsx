
import { useRef, useEffect } from 'react';

interface TouchGesturesOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefaultOnSwipe?: boolean;
}

export function useTouchGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  preventDefaultOnSwipe = true,
}: TouchGesturesOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!startX.current || !startY.current) return;
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = startX.current - currentX;
      const diffY = startY.current - currentY;
      
      // Determine if it's a horizontal or vertical swipe
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > threshold && onSwipeLeft) {
          onSwipeLeft();
          if (preventDefaultOnSwipe) e.preventDefault();
        } else if (diffX < -threshold && onSwipeRight) {
          onSwipeRight();
          if (preventDefaultOnSwipe) e.preventDefault();
        }
      } else {
        // Vertical swipe
        if (diffY > threshold && onSwipeUp) {
          onSwipeUp();
          if (preventDefaultOnSwipe) e.preventDefault();
        } else if (diffY < -threshold && onSwipeDown) {
          onSwipeDown();
          if (preventDefaultOnSwipe) e.preventDefault();
        }
      }
      
      // Reset after swipe detection
      startX.current = null;
      startY.current = null;
    };
    
    // Add the event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefaultOnSwipe });
    
    // Clean up
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, preventDefaultOnSwipe]);
  
  return { ref };
}
