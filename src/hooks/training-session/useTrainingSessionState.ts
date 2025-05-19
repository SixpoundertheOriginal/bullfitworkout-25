
import { useState } from 'react';
import { useWorkoutStore } from '@/store/workout';
import { shallow } from 'zustand/shallow';

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
  
  // Extract workout state from the store
  const workoutState = useWorkoutStore(state => ({
    exercises: state.exercises,
    activeExercise: state.activeExercise,
    elapsedTime: state.elapsedTime,
    isActive: state.isActive,
    workoutStatus: state.workoutStatus,
    workoutId: state.workoutId,
    restTimerActive: state.restTimerActive,
    trainingConfig: state.trainingConfig,
    postSetFlow: state.postSetFlow,
    lastCompletedExercise: state.lastCompletedExercise,
    lastCompletedSetIndex: state.lastCompletedSetIndex,
    focusedExercise: state.focusedExercise,
    currentRestTime: state.currentRestTime,
    setRestTimerActive: state.setRestTimerActive
  }), shallow);
  
  // Action functions from the store
  // Fixed: Remove arguments when calling loadTrainingConfig and similar functions
  const workoutActions = useWorkoutStore(state => ({
    setExercises: state.setExercises,
    handleCompleteSet: state.handleCompleteSet,
    deleteExercise: state.deleteExercise,
    resetSession: state.resetSession,
    startWorkout: state.startWorkout,
    endWorkout: state.endWorkout,
    setPostSetFlow: state.setPostSetFlow,
    setFocusedExercise: state.setFocusedExercise,
    submitSetRating: state.submitSetRating
  }), shallow);

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
