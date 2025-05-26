
import { useMemo, useState, useRef } from 'react';
import { useWorkoutStore } from '@/store/workout';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';

/**
 * Simplified hook that provides access to workout state and actions
 * PHASE 1: Removed complex validation to stop infinite loops
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
  
  // Monitor Supabase connection status (stable reference)
  const connectionState = useSupabaseConnection();
  
  // Initialization flag to prevent repeated initialization
  const initializedRef = useRef(false);
  
  // Simple one-time initialization without complex validation
  if (!initializedRef.current) {
    console.log("🔧 Training session state initialized");
    initializedRef.current = true;
  }
  
  // Simplified state with connection monitoring - memoized to prevent re-renders
  const state = useMemo(() => {
    return {
      // Expose all workout store state
      ...workoutState,
      
      // Expose connection state
      connectionState,
      
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
      triggerRestTimerReset: () => setRestTimerResetSignal(prev => prev + 1),
    };
  }, [
    workoutState, 
    connectionState,
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
