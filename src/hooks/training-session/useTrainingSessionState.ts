
import { useMemo, useState } from 'react';
import { useWorkoutStore } from '@/store/workout';
import { getExerciseName } from '@/utils/exerciseAdapter';

/**
 * Hook that provides access to all workout state and actions
 * Centralizes the state management for the training session
 */
export const useTrainingSessionState = () => {
  // Local state for UI components
  const [isAddExerciseSheetOpen, setIsAddExerciseSheetOpen] = useState(false);
  const [isRatingSheetOpen, setIsRatingSheetOpen] = useState(false);
  const [showRestTimerModal, setShowRestTimerModal] = useState(false);
  const [showEnhancedRestTimer, setShowEnhancedRestTimer] = useState(false);
  const [showCompletionConfirmation, setShowCompletionConfirmation] = useState(false);
  const [completedExerciseName, setCompletedExerciseName] = useState<string | null>(null);
  const [restTimerResetSignal, setRestTimerResetSignal] = useState(0);
  
  // Get the workout store state and actions
  const workoutState = useWorkoutStore();
  
  // Use a memoized structure for improved performance
  const state = useMemo(() => {
    return {
      // Expose all workout store state
      ...workoutState,
      
      // Expose local UI state
      isAddExerciseSheetOpen,
      setIsAddExerciseSheetOpen,
      isRatingSheetOpen,
      setIsRatingSheetOpen,
      showRestTimerModal,
      setShowRestTimerModal,
      showEnhancedRestTimer, 
      setShowEnhancedRestTimer,
      showCompletionConfirmation,
      setShowCompletionConfirmation,
      completedExerciseName,
      setCompletedExerciseName,
      
      // Rest timer reset signal
      restTimerResetSignal,
      
      // Helper function to trigger rest timer reset
      triggerRestTimerReset: () => setRestTimerResetSignal(prev => prev + 1)
    };
  }, [
    workoutState, 
    isAddExerciseSheetOpen,
    isRatingSheetOpen,
    showRestTimerModal,
    showEnhancedRestTimer,
    showCompletionConfirmation,
    completedExerciseName,
    restTimerResetSignal
  ]);
  
  return state;
};
