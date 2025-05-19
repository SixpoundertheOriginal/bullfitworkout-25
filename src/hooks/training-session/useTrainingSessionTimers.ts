
import { useCallback } from 'react';

/**
 * Hook for managing rest timers in a training session
 */
export const useTrainingSessionTimers = (
  setShowRestTimerModal: (show: boolean) => void, 
  setShowEnhancedRestTimer: (show: boolean) => void,
  setPostSetFlow: (state: string) => void,
) => {
  // Rest timer management
  const handleShowRestTimer = useCallback(() => {
    setShowRestTimerModal(true);
  }, [setShowRestTimerModal]);
  
  const handleRestTimerComplete = useCallback(() => {
    setShowRestTimerModal(false);
    setShowEnhancedRestTimer(false);
    setPostSetFlow('idle');
  }, [setShowRestTimerModal, setShowEnhancedRestTimer, setPostSetFlow]);

  return {
    handleShowRestTimer,
    handleRestTimerComplete
  };
};
