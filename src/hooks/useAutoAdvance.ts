
import { useCallback, useRef } from 'react';

interface UseAutoAdvanceOptions {
  delay?: number;
  onAdvance?: () => void;
}

export function useAutoAdvance({ delay = 500, onAdvance }: UseAutoAdvanceOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAutoAdvance = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-advance
    timeoutRef.current = setTimeout(() => {
      onAdvance?.();
      timeoutRef.current = null;
    }, delay);
  }, [delay, onAdvance]);

  const cancelAutoAdvance = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    cancelAutoAdvance();
  }, [cancelAutoAdvance]);

  return {
    triggerAutoAdvance,
    cancelAutoAdvance,
    cleanup
  };
}
