
import { useState } from 'react';
import { useWorkoutStore } from '@/store/workout';

/**
 * Hook for managing the UI state of a training session
 */
export const useTrainingSessionState = () => {
  // UI State
  const [showRestTimerModal, setShowRestTimerModal] = useState(false);
  const [showEnhancedRestTimer, setShowEnhancedRestTimer] = useState(false);
  const [restTimerResetSignal, setRestTimerResetSignal] = useState(0);
  const [isAddExerciseSheetOpen, setIsAddExerciseSheetOpen] = useState(false);
  const [showCompletionConfirmation, setShowCompletionConfirmation] = useState(false);
  const [completedExerciseName, setCompletedExerciseName] = useState<string | null>(null);
  const [isRatingSheetOpen, setIsRatingSheetOpen] = useState(false);
  
  // Extract workout state from the store - using the hook directly
  const workoutStore = useWorkoutStore();
  
  // Extract the state properties we need
  const workoutState = {
    exercises: workoutStore.exercises,
    activeExercise: workoutStore.activeExercise,
    elapsedTime: workoutStore.elapsedTime,
    isActive: workoutStore.isActive,
    workoutStatus: workoutStore.workoutStatus,
    workoutId: workoutStore.workoutId,
    restTimerActive: workoutStore.restTimerActive,
    trainingConfig: workoutStore.trainingConfig,
    postSetFlow: workoutStore.postSetFlow,
    lastCompletedExercise: workoutStore.lastCompletedExercise,
    lastCompletedSetIndex: workoutStore.lastCompletedSetIndex,
    focusedExercise: workoutStore.focusedExercise,
    currentRestTime: workoutStore.currentRestTime,
    setRestTimerActive: workoutStore.setRestTimerActive
  };
  
  // Action functions from the store
  const workoutActions = {
    setExercises: workoutStore.setExercises,
    handleCompleteSet: workoutStore.handleCompleteSet,
    deleteExercise: workoutStore.deleteExercise,
    resetSession: workoutStore.resetSession,
    startWorkout: workoutStore.startWorkout,
    endWorkout: workoutStore.endWorkout,
    setPostSetFlow: workoutStore.setPostSetFlow,
    setFocusedExercise: workoutStore.setFocusedExercise,
    submitSetRating: workoutStore.submitSetRating
  };

  // Helper for timer reset
  const triggerRestTimerReset = () => {
    setRestTimerResetSignal(prev => prev + 1);
  };

  return {
    ...workoutState,
    ...workoutActions,
    
    // UI state
    showRestTimerModal,
    setShowRestTimerModal,
    showEnhancedRestTimer,
    setShowEnhancedRestTimer,
    restTimerResetSignal,
    triggerRestTimerReset,
    isAddExerciseSheetOpen,
    setIsAddExerciseSheetOpen,
    showCompletionConfirmation,
    setShowCompletionConfirmation,
    completedExerciseName,
    setCompletedExerciseName,
    isRatingSheetOpen,
    setIsRatingSheetOpen,
  };
};
