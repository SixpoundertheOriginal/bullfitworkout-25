
import { useEffect } from 'react';
import { useWorkoutSave } from '@/hooks/useWorkoutSave';
import { useTrainingSessionState } from './useTrainingSessionState';
import { useTrainingSessionData } from './useTrainingSessionData';
import { useTrainingSessionHandlers } from './useTrainingSessionHandlers';
import { useTrainingSessionInit } from './useTrainingSessionInit';
import { useTrainingSessionTimers } from './useTrainingSessionTimers';
import { WorkoutExercises } from '@/store/workout/types';
import { adaptExerciseSets } from '@/utils/exerciseAdapter';

/**
 * Main hook that composes all training session sub-hooks together
 * This maintains the same API as the original useTrainingSession
 */
export const useTrainingSession = () => {
  // Get state from the store and local state
  const state = useTrainingSessionState();
  
  // Convert store exercises to the format expected by useTrainingSessionData
  const adaptedExercises = adaptExerciseSets(state.exercises as WorkoutExercises);
  
  // Get computed/derived data
  const data = useTrainingSessionData(adaptedExercises, state.focusedExercise);
  
  // Get workout save logic
  const {
    saveStatus,
    handleCompleteWorkout: rawHandleCompleteWorkout,
    attemptRecovery: rawAttemptRecovery,
    workoutId: savedWorkoutId
  } = useWorkoutSave(state.exercises, state.elapsedTime, state.resetSession);
  
  // Get initialization logic
  const init = useTrainingSessionInit(
    state.isActive, 
    data.hasExercises, 
    state.startWorkout
  );
  
  // Get timer management functions
  const timers = useTrainingSessionTimers(
    state.setShowRestTimerModal,
    state.setShowEnhancedRestTimer,
    state.setPostSetFlow
  );
  
  // Get handler functions that use the centralized types
  const handlers = useTrainingSessionHandlers(
    state.exercises as WorkoutExercises,
    data.completedSets,
    state.trainingConfig,
    state.setExercises as (exercises: WorkoutExercises | ((prev: WorkoutExercises) => WorkoutExercises)) => void,
    state.setFocusedExercise,
    state.setCompletedExerciseName,
    state.setShowCompletionConfirmation,
    rawHandleCompleteWorkout,
    rawAttemptRecovery
  );
  
  // Update UI state when post-set flow changes
  useEffect(() => {
    if (state.postSetFlow === 'rating') {
      state.setIsRatingSheetOpen(true);
    } else if (state.postSetFlow === 'rest') {
      state.setShowEnhancedRestTimer(true);
    }
  }, [state.postSetFlow, state.setIsRatingSheetOpen, state.setShowEnhancedRestTimer]);
  
  // Construct a handler that needs internal handlers
  const handleNextExercise = () => {
    handlers.handleNextExercise(data.nextExerciseName, handlers.handleFinishWorkout);
  };
  
  const handleSubmitRating = (rpe: number) => {
    state.submitSetRating(rpe);
    state.setIsRatingSheetOpen(false);
  };
  
  const setRestTimerActiveState = (active: boolean) => {
    state.setRestTimerActive(active);
  };

  const isSaving = state.workoutStatus === 'saving';

  return {
    // State - Use adapted exercises for external consumption
    exercises: adaptedExercises,
    activeExercise: state.activeExercise,
    elapsedTime: state.elapsedTime,
    hasExercises: data.hasExercises,
    exerciseCount: data.exerciseCount,
    completedSets: data.completedSets,
    totalSets: data.totalSets,
    workoutStatus: state.workoutStatus,
    workoutId: state.workoutId || savedWorkoutId,
    restTimerActive: state.restTimerActive,
    isSaving,
    saveStatus,
    showRestTimerModal: state.showRestTimerModal,
    showEnhancedRestTimer: state.showEnhancedRestTimer,
    restTimerResetSignal: state.restTimerResetSignal,
    currentRestTime: state.currentRestTime,
    isAddExerciseSheetOpen: state.isAddExerciseSheetOpen,
    setIsAddExerciseSheetOpen: state.setIsAddExerciseSheetOpen,
    focusedExercise: state.focusedExercise,
    showCompletionConfirmation: state.showCompletionConfirmation,
    completedExerciseName: state.completedExerciseName,
    nextExerciseName: data.nextExerciseName,
    isRatingSheetOpen: state.isRatingSheetOpen,
    setIsRatingSheetOpen: state.setIsRatingSheetOpen,
    postSetFlow: state.postSetFlow,
    lastCompletedExercise: state.lastCompletedExercise,
    lastCompletedSetIndex: state.lastCompletedSetIndex,
    trainingConfig: state.trainingConfig,
    
    // Methods from handlers
    handleAddSet: handlers.handleAddSet,
    handleAddExercise: handlers.handleAddExercise,
    handleShowRestTimer: timers.handleShowRestTimer,
    handleRestTimerComplete: timers.handleRestTimerComplete,
    handleSubmitRating,
    handleFocusExercise: handlers.handleFocusExercise,
    handleFinishWorkout: handlers.handleFinishWorkout,
    attemptRecovery: handlers.attemptRecovery,
    handleNextExercise,
    handleCompleteExercise: handlers.handleCompleteExercise,
    handleSetExercises: state.setExercises,
    handleCompleteSet: state.handleCompleteSet,
    deleteExercise: state.deleteExercise,
    setFocusedExercise: state.setFocusedExercise,
    triggerRestTimerReset: state.triggerRestTimerReset,
    getNextSetDetails: data.getNextSetDetails,
    resetSession: state.resetSession,
    
    // UI state setters
    setShowCompletionConfirmation: state.setShowCompletionConfirmation,
    setPostSetFlow: state.setPostSetFlow,
    setRestTimerActive: setRestTimerActiveState,
    setShowEnhancedRestTimer: state.setShowEnhancedRestTimer,
    setShowRestTimerModal: state.setShowRestTimerModal
  };
};

export * from './useTrainingSessionState';
export * from './useTrainingSessionData';
export * from './useTrainingSessionHandlers';
export * from './useTrainingSessionInit';
export * from './useTrainingSessionTimers';
