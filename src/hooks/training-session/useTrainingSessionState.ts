
import { useMemo, useState, useEffect } from 'react';
import { useWorkoutStore } from '@/store/workout';
import { getExerciseName } from '@/utils/exerciseAdapter';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';

/**
 * Enhanced hook that provides access to all workout state and actions
 * with comprehensive validation and connection monitoring
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
  
  // Monitor Supabase connection status
  const connectionState = useSupabaseConnection();
  
  // Enhanced validation on initialization
  useEffect(() => {
    console.log("🔧 Initializing training session with enhanced validation");
    
    // Run validation after a short delay to ensure store is fully loaded
    const timer = setTimeout(() => {
      workoutState.runWorkoutValidation();
      
      // Log connection status for debugging
      console.log('🔌 Connection status:', {
        isConnected: connectionState.isConnected,
        isConnecting: connectionState.isConnecting,
        retryCount: connectionState.retryCount,
        hasConnectivity: connectionState.hasConnectivity
      });
    }, 300);
    
    return () => clearTimeout(timer);
  }, [workoutState.runWorkoutValidation]);
  
  // Monitor for zombie workouts during the session
  useEffect(() => {
    if (workoutState.isActive && Object.keys(workoutState.exercises).length === 0) {
      console.warn('🧟‍♂️ Zombie workout detected during session - cleaning up');
      workoutState.detectAndCleanupZombieWorkout();
    }
  }, [workoutState.isActive, workoutState.exercises, workoutState.detectAndCleanupZombieWorkout]);
  
  // Enhanced state with connection monitoring
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
      
      // Enhanced validation helper
      validateWorkoutState: () => {
        console.log('🔍 Manual workout state validation requested');
        workoutState.runWorkoutValidation();
      }
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
