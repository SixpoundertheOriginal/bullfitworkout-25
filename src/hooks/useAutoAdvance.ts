
import { useCallback, useRef, useState } from 'react';

interface UseAutoAdvanceOptions {
  delay?: number;
  onAdvance?: () => void;
  fallbackToManual?: boolean;
  enableRollback?: boolean;
}

interface AutoAdvanceState {
  isAdvancing: boolean;
  canRollback: boolean;
  lastAction: string | null;
}

export function useAutoAdvance({ 
  delay = 500, 
  onAdvance, 
  fallbackToManual = true,
  enableRollback = true 
}: UseAutoAdvanceOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [state, setState] = useState<AutoAdvanceState>({
    isAdvancing: false,
    canRollback: false,
    lastAction: null
  });

  const triggerAutoAdvance = useCallback((actionName?: string) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState(prev => ({ 
      ...prev, 
      isAdvancing: true, 
      lastAction: actionName || 'auto-advance' 
    }));

    // Set new timeout for auto-advance
    timeoutRef.current = setTimeout(() => {
      try {
        onAdvance?.();
        
        if (enableRollback) {
          setState(prev => ({ 
            ...prev, 
            isAdvancing: false, 
            canRollback: true 
          }));
        } else {
          setState(prev => ({ ...prev, isAdvancing: false }));
        }
        
        timeoutRef.current = null;
      } catch (error) {
        console.error('Auto-advance failed:', error);
        
        if (fallbackToManual) {
          setState(prev => ({ 
            ...prev, 
            isAdvancing: false, 
            canRollback: false 
          }));
          // Could trigger a manual flow here
        }
      }
    }, delay);
  }, [delay, onAdvance, fallbackToManual, enableRollback]);

  const cancelAutoAdvance = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setState(prev => ({ ...prev, isAdvancing: false }));
  }, []);

  const rollback = useCallback(() => {
    if (state.canRollback) {
      setState(prev => ({ ...prev, canRollback: false }));
      // Trigger rollback action
      return true;
    }
    return false;
  }, [state.canRollback]);

  const cleanup = useCallback(() => {
    cancelAutoAdvance();
    setState({
      isAdvancing: false,
      canRollback: false,
      lastAction: null
    });
  }, [cancelAutoAdvance]);

  return {
    triggerAutoAdvance,
    cancelAutoAdvance,
    rollback,
    cleanup,
    isAdvancing: state.isAdvancing,
    canRollback: state.canRollback,
    lastAction: state.lastAction
  };
}
