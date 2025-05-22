
import { useCallback } from 'react';

// Enhanced haptic patterns aligned with iOS Human Interface Guidelines
export type HapticPattern = 
  // Standard feedbacks
  | 'light' | 'medium' | 'heavy' 
  // Semantic feedbacks
  | 'success' | 'warning' | 'error'
  // Special patterns
  | 'selection' | 'impact' | 'notification';

type HapticOptions = {
  // Controls haptic intensity (0-1)
  intensity?: number;
  // For creating sequential patterns
  repeat?: number;
  // Delay between repeats (ms)
  delay?: number;
}

/**
 * Enhanced haptic feedback hook aligned with iOS Human Interface Guidelines
 * Provides precise control over haptic feedback and fallback behavior
 */
export const useHaptics = () => {
  const isHapticsSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  
  const triggerHaptic = useCallback((
    pattern: HapticPattern = 'medium',
    options: HapticOptions = {}
  ) => {
    if (!isHapticsSupported) return;
    
    // Extract options with defaults
    const { intensity = 1, repeat = 1, delay = 25 } = options;
    
    // Adjust base durations by intensity (0.3-1.0 scaling)
    const intensityFactor = Math.max(0.3, Math.min(intensity, 1));
    
    // Map patterns to vibration sequences (duration in ms)
    // Aligned with iOS haptic feedback patterns
    const basePatterns = {
      // Standard tactile feedback
      light: [10],
      medium: [15],
      heavy: [20],
      
      // Semantic feedback (success uses pleasing rhythm)
      success: [10, 30, 15],
      warning: [30, 50, 30],
      error: [50, 100, 50],
      
      // Special interaction patterns
      selection: [5],
      impact: [25],
      notification: [15, 50, 15]
    };
    
    // Get the base pattern
    const basePattern = basePatterns[pattern];
    
    // Apply intensity scaling
    const scaledPattern = basePattern.map(duration => 
      Math.round(duration * intensityFactor)
    );
    
    // Create the final pattern with repetition if needed
    let finalPattern: number[] = [];
    
    // Add the pattern with delays between repetitions
    for (let i = 0; i < repeat; i++) {
      finalPattern = [...finalPattern, ...scaledPattern];
      if (i < repeat - 1 && delay > 0) {
        // Add delay between patterns (as a pause)
        finalPattern.push(delay);
      }
    }
    
    try {
      navigator.vibrate(finalPattern);
    } catch (error) {
      console.debug('Haptic feedback failed:', error);
    }
  }, [isHapticsSupported]);
  
  // Method to cancel any ongoing haptic feedback
  const cancelHaptic = useCallback(() => {
    if (isHapticsSupported) {
      try {
        navigator.vibrate(0);
      } catch (error) {
        console.debug('Canceling haptics failed:', error);
      }
    }
  }, [isHapticsSupported]);
  
  return { 
    triggerHaptic, 
    cancelHaptic, 
    isHapticsSupported 
  };
};
