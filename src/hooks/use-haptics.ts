
import { useCallback } from 'react';

type HapticIntensity = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Hook for triggering haptic feedback on supported devices
 * Falls back gracefully on unsupported devices
 */
export const useHaptics = () => {
  const isHapticsSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  
  const triggerHaptic = useCallback((intensity: HapticIntensity = 'medium') => {
    if (!isHapticsSupported) return;
    
    // Map intensity to vibration pattern (duration in ms)
    const patterns = {
      light: [10],
      medium: [15],
      heavy: [20],
      success: [10, 30, 10],
      warning: [30, 50, 30],
      error: [50, 100, 50]
    };
    
    try {
      navigator.vibrate(patterns[intensity]);
    } catch (error) {
      console.debug('Haptic feedback failed:', error);
    }
  }, [isHapticsSupported]);
  
  return { triggerHaptic, isHapticsSupported };
};
