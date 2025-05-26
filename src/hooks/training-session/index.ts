
import { useEffect, useMemo, useCallback } from 'react';
import { useWorkoutSave } from '@/hooks/useWorkoutSave';
import { useTrainingSessionState } from './useTrainingSessionState';
import { useTrainingSessionData } from './useTrainingSessionData';
import { useTrainingSessionHandlers } from './useTrainingSessionHandlers';
import { useTrainingSessionInit } from './useTrainingSessionInit';
import { useTrainingSessionTimers } from './useTrainingSessionTimers';

/**
 * Main hook that composes all training session sub-hooks together
 * FIXED: Proper memoization to prevent infinite re-renders
 */
export const useTrainingSession = () => {
  // Get state from the store and local state
  const state = useTrainingSessionState();
  
  // Get computed/derived data - FIXED: Using store types directly
  const data = useTrainingSessionData(state.exercises, state.focusedExercise);
  
  // Get workout save logic - memoized to prevent re-creation
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
  
  // Get timer management functions - memoized
  const timers = useTrainingSessionTimers(
    state.setShowRestTimerModal,
    state.setShowEnhancedRestTimer,
    state.setPostSetFlow
  );
  
  // Memoize handler dependencies to prevent re-creation
  const handlerDependencies = useMemo(() => ({
    exercises: state.exercises,
    completedSets: data.completedSets,
    trainingConfig: state.trainingConfig,
    setExercises: state.setExercises,
    setFocusedExercise: state.setFocusedExercise,
    setCompletedExerciseName: state.setCompletedExerciseName,
    setShowCompletionConfirmation: state.setShowCompletionConfirmation,
    rawHandleCompleteWorkout,
    rawAttemptRecovery
  }), [
    state.exercises,
    data.completedSets,
    state.trainingConfig,
    state.setExercises,
    state.setFocusedExercise,
    state.setCompletedExerciseName,
    state.setShowCompletionConfirmation,
    rawHandleCompleteWorkout,
    rawAttemptRecovery
  ]);
  
  // Get handler functions - FIXED: Only recreate when dependencies actually change
  const handlers = useTrainingSessionHandlers(
    handlerDependencies.exercises,
    handlerDependencies.completedSets,
    handlerDependencies.trainingConfig,
    handlerDependencies.setExercises,
    handlerDependencies.setFocusedExercise,
    handlerDependencies.setCompletedExerciseName,
    handlerDependencies.setShowCompletionConfirmation,
    handlerDependencies.rawHandleCompleteWorkout,
    handlerDependencies.rawAttemptRecovery
  );
  
  // Update UI state when post-set flow changes
  useEffect(() => {
    if (state.postSetFlow === 'rating') {
      state.setIsRatingSheetOpen(true);
    } else if (state.postSetFlow === 'rest') {
      state.setShowEnhancedRestTimer(true);
    }
  }, [state.postSetFlow, state.setIsRatingSheetOpen, state.setShowEnhancedRestTimer]);
  
  // Memoize frequently used handlers to prevent re-creation
  const handleNextExercise = useCallback(() => {
    handlers.handleNextExercise(data.nextExerciseName, handlers.handleFinishWorkout);
  }, [handlers.handleNextExercise, data.nextExerciseName, handlers.handleFinishWorkout]);

  const handleSubmitRating = useCallback((rpe: number) => {
    state.submitSetRating(rpe);
    state.setIsRatingSheetOpen(false);
  }, [state.submitSetRating, state.setIsRatingSheetOpen]);
  
  const setRestTimerActiveState = useCallback((active: boolean) => {
    state.setRestTimerActive(active);
  }, [state.setRestTimerActive]);

  const isSaving = state.workoutStatus === 'saving';

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    // State - using raw exercises from store
    exercises: state.exercises,
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
  }), [
    state,
    data,
    savedWorkoutId,
    isSaving,
    saveStatus,
    handlers,
    timers,
    handleNextExercise,
    handleSubmitRating,
    setRestTimerActiveState
  ]);
};

export * from './useTrainingSessionState';
export * from './useTrainingSessionData';
export * from './useTrainingSessionHandlers';
export * from './useTrainingSessionInit';
export * from './useTrainingSessionTimers';
