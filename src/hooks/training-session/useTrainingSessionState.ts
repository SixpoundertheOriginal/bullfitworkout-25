
import { useMemo, useState, useEffect, useRef } from 'react';
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
  
  // Ref to track if initial validation has run
  const initialValidationRef = useRef(false);
  const zombieCleanupRef = useRef(false);
  
  // Enhanced validation on initialization - FIXED: Run only once with proper dependencies
  useEffect(() => {
    if (initialValidationRef.current) return;
    
    console.log("🔧 Running initial training session validation");
    
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
      
      initialValidationRef.current = true;
    }, 300);
    
    return () => clearTimeout(timer);
  }, []); // Run only once on mount
  
  // Monitor for zombie workouts - FIXED: Only run when specific conditions change
  useEffect(() => {
    const isActiveWithNoExercises = workoutState.isActive && Object.keys(workoutState.exercises).length === 0;
    
    if (isActiveWithNoExercises && !zombieCleanupRef.current) {
      console.warn('🧟‍♂️ Potential zombie workout detected during session - checking');
      
      // Set flag to prevent repeated runs
      zombieCleanupRef.current = true;
      
      // Run cleanup after a delay to avoid running during initial session setup
      const timer = setTimeout(() => {
        workoutState.detectAndCleanupZombieWorkout();
        zombieCleanupRef.current = false; // Reset for future checks
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [workoutState.isActive, Object.keys(workoutState.exercises).length]); // Only run when these specific values change
  
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
      
      // Enhanced validation helper - FIXED: Manual trigger only
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
