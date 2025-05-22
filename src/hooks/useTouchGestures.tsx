
import { useRef, useEffect, useState } from 'react';

interface TouchGesturesOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: (e: TouchEvent) => void;
  onDoubleTap?: (e: TouchEvent) => void;
  onLongPress?: (e: TouchEvent) => void;
  threshold?: number;
  longPressThreshold?: number;
  doubleTapThreshold?: number;
  preventDefaultOnSwipe?: boolean;
  preventDefaultOnTap?: boolean;
  disableScroll?: boolean;
}

/**
 * Advanced iOS-style touch gesture hook
 * Provides natural gesture detection with iOS-like behavior and feedback
 */
export function useTouchGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onDoubleTap,
  onLongPress,
  threshold = 40,
  longPressThreshold = 500,
  doubleTapThreshold = 300,
  preventDefaultOnSwipe = true,
  preventDefaultOnTap = false,
  disableScroll = false,
}: TouchGesturesOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const lastTapTime = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);
  const isLongPressing = useRef<boolean>(false);

  // Track if touch is currently active
  const [isTouching, setIsTouching] = useState(false);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    // Clear any timers on unmount
    return () => {
      if (longPressTimer.current) {
        window.clearTimeout(longPressTimer.current);
      }
    };
  }, []);
    
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      
      setIsTouching(true);
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      startTime.current = Date.now();
      isSwiping.current = false;
      isLongPressing.current = false;
      
      // Start long press timer
      if (onLongPress) {
        longPressTimer.current = window.setTimeout(() => {
          if (
            startX.current !== null && 
            startY.current !== null && 
            !isSwiping.current
          ) {
            isLongPressing.current = true;
            onLongPress(e);
            
            // Provide haptic feedback
            if ('vibrate' in navigator) {
              navigator.vibrate(50);
            }
          }
        }, longPressThreshold);
      }

      // Handle scroll disabling
      if (disableScroll) {
        e.preventDefault();
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!startX.current || !startY.current || e.touches.length !== 1) return;
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = startX.current - currentX;
      const diffY = startY.current - currentY;
      const distance = Math.sqrt(diffX * diffX + diffY * diffY);
      
      // Cancel long press if we've moved beyond a mini-threshold
      if (distance > 10) {
        if (longPressTimer.current) {
          window.clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }
      
      // Determine if we've crossed the swipe threshold
      if (distance > threshold) {
        isSwiping.current = true;
        
        // Determine direction
        const absX = Math.abs(diffX);
        const absY = Math.abs(diffY);
        
        // Horizontal swipe is priority if stronger
        if (absX > absY) {
          if (diffX > threshold && onSwipeLeft) {
            onSwipeLeft();
            if (preventDefaultOnSwipe) e.preventDefault();
            // Reset to prevent multiple triggers
            startX.current = null;
            startY.current = null;
          } else if (diffX < -threshold && onSwipeRight) {
            onSwipeRight();
            if (preventDefaultOnSwipe) e.preventDefault();
            // Reset to prevent multiple triggers
            startX.current = null;
            startY.current = null;
          }
        } else {
          if (diffY > threshold && onSwipeUp) {
            onSwipeUp();
            if (preventDefaultOnSwipe) e.preventDefault();
            // Reset to prevent multiple triggers
            startX.current = null;
            startY.current = null;
          } else if (diffY < -threshold && onSwipeDown) {
            onSwipeDown();
            if (preventDefaultOnSwipe) e.preventDefault();
            // Reset to prevent multiple triggers
            startX.current = null;
            startY.current = null;
          }
        }
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      setIsTouching(false);
      
      // Clear long press timer
      if (longPressTimer.current) {
        window.clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      
      // Handle tap/double tap
      if (!isSwiping.current && !isLongPressing.current && startTime.current) {
        const touchDuration = Date.now() - startTime.current;
        
        // Check if it's a quick touch (tap)
        if (touchDuration < 300) {
          const now = Date.now();
          const timeSinceLastTap = now - lastTapTime.current;
          
          if (timeSinceLastTap < doubleTapThreshold && onDoubleTap) {
            // It's a double tap
            onDoubleTap(e);
            if (preventDefaultOnTap) e.preventDefault();
            lastTapTime.current = 0; // Reset
          } else {
            // It's a single tap
            if (onTap) {
              onTap(e);
              if (preventDefaultOnTap) e.preventDefault();
            }
            lastTapTime.current = now;
          }
        }
      }
      
      // Reset state
      startX.current = null;
      startY.current = null;
      startTime.current = null;
      isSwiping.current = false;
      isLongPressing.current = false;
    };
    
    const handleTouchCancel = () => {
      setIsTouching(false);
      
      // Clear any ongoing timers
      if (longPressTimer.current) {
        window.clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      
      // Reset all state
      startX.current = null;
      startY.current = null;
      startTime.current = null;
      isSwiping.current = false;
      isLongPressing.current = false;
    };
    
    // Add the event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: !disableScroll });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefaultOnSwipe });
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchCancel);
    
    // Clean up
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [
    onSwipeLeft, 
    onSwipeRight, 
    onSwipeUp, 
    onSwipeDown, 
    onTap,
    onDoubleTap,
    onLongPress,
    threshold, 
    longPressThreshold,
    doubleTapThreshold,
    preventDefaultOnSwipe,
    preventDefaultOnTap,
    disableScroll
  ]);
  
  return { ref, isTouching };
}
