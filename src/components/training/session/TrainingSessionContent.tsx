
import React, { useCallback } from 'react';
import { useTrainingSession } from "@/hooks/training-session";
import { ExerciseCompletionConfirmation } from "@/components/training/ExerciseCompletionConfirmation";
import { SetsDebugger } from "@/components/training/SetsDebugger";
import { ExerciseFAB } from "@/components/training/ExerciseFAB";
import { adaptExerciseSets, safeRenderableExercise } from "@/utils/exerciseAdapter";
import { WorkoutExercises, PostSetFlowState } from '@/store/workout/types';
import { ExerciseListWrapper } from "./ExerciseListWrapper";
import { TrainingSessionSheets } from "./TrainingSessionSheets";
import { TrainingSessionTimers } from "@/components/training/TrainingSessionTimers";
import { WorkoutMetricsPanel } from "./metrics/WorkoutMetricsPanel";
import { TrainingSessionLayout } from "./layout/TrainingSessionLayout";
import { TrainingActionButtons } from "./actions/TrainingActionButtons";
import { SaveProgress } from "@/types/workout";
import { DirectAddExerciseButton } from "./DirectAddExerciseButton";
import { getStore } from '@/store/workout/store'; // Added missing import for getStore

interface TrainingSessionContentProps {
  onFinishWorkoutClick: () => void;
  isSaving: boolean;
}

export const TrainingSessionContent: React.FC<TrainingSessionContentProps> = ({
  onFinishWorkoutClick,
  isSaving,
}) => {
  const {
    // State
    exercises,
    activeExercise,
    elapsedTime,
    exerciseCount,
    completedSets,
    totalSets,
    workoutStatus,
    workoutId,
    restTimerActive,
    showRestTimerModal,
    showEnhancedRestTimer,
    restTimerResetSignal,
    currentRestTime,
    focusedExercise,
    showCompletionConfirmation,
    completedExerciseName,
    nextExerciseName,
    lastCompletedExercise,
    lastCompletedSetIndex,
    isAddExerciseSheetOpen,
    setIsAddExerciseSheetOpen,
    isRatingSheetOpen,
    setIsRatingSheetOpen,
    trainingConfig,
    
    // Methods
    handleRestTimerComplete,
    handleShowRestTimer,
    handleNextExercise,
    handleFocusExercise,
    triggerRestTimerReset,
    getNextSetDetails,
    attemptRecovery,
    handleAddExercise,
    handleSubmitRating,
    handleAddSet,
    
    // UI state setters
    setShowCompletionConfirmation,
    setFocusedExercise,
    setShowRestTimerModal,
    setShowEnhancedRestTimer,
    setRestTimerActive,
    setPostSetFlow
  } = useTrainingSession();
  
  // Wrap handleAddExercise with useCallback and add logging
  const enhancedHandleAddExercise = useCallback((exerciseName: string) => {
    console.log('TrainingSessionContent: enhancedHandleAddExercise called with', exerciseName);
    // Log the current state of exercises before adding
    console.log('TrainingSessionContent: Current exercises before adding:', Object.keys(exercises));
    
    // Call the original handler from useTrainingSession
    handleAddExercise(exerciseName);
    
    // Schedule a check to verify if the exercise was added
    setTimeout(() => {
      console.log('TrainingSessionContent: Exercises after adding (timeout check):', 
        Object.keys(getStore().getState().exercises));
    }, 500);
  }, [handleAddExercise, exercises]);
  
  // Make sure focusedExercise is always a safe string
  const safeFocusedExercise = focusedExercise 
    ? safeRenderableExercise(focusedExercise) 
    : null;
  
  // Make sure activeExercise is always a safe string
  const safeActiveExercise = activeExercise 
    ? safeRenderableExercise(activeExercise) 
    : null;

  // Function to handle adding a set to the focused exercise with better logging
  const handleAddSetToFocused = useCallback(() => {
    console.log('TrainingSessionContent: handleAddSetToFocused called');
    if (focusedExercise) {
      const safeExerciseName = safeRenderableExercise(focusedExercise);
      console.log('TrainingSessionContent: Adding set to focused exercise:', safeExerciseName);
      handleAddSet(safeExerciseName);
    } else {
      console.log('TrainingSessionContent: No focused exercise to add set to');
    }
  }, [focusedExercise, handleAddSet]);

  // Function to open add exercise sheet with better logging
  const handleOpenAddExercise = useCallback(() => {
    console.log('TrainingSessionContent: handleOpenAddExercise called - setting sheet to open');
    console.log('TrainingSessionContent: isAddExerciseSheetOpen before:', isAddExerciseSheetOpen);
    setIsAddExerciseSheetOpen(true);
    
    // Schedule a check to verify if the sheet was opened
    setTimeout(() => {
      console.log('TrainingSessionContent: isAddExerciseSheetOpen after (timeout check):', 
        getStore().getState().isAddExerciseSheetOpen);
    }, 100);
  }, [setIsAddExerciseSheetOpen, isAddExerciseSheetOpen]);

  // Create a wrapper for the attemptRecovery function with the required signature
  const handleAttemptRecovery = useCallback(() => {
    if (workoutId) {
      // Pass all required arguments for the AttemptRecoveryFn signature
      attemptRecovery(workoutId, 'manual', {});
    }
  }, [workoutId, attemptRecovery]);

  // Determine if we should show the development debugger
  const showDebugger = process.env.NODE_ENV !== 'production';

  // Adapt exercises to the component-friendly format
  const adaptedExercises = adaptExerciseSets(exercises);

  // Check if there are exercises to show finish button
  const hasExercises = Object.keys(adaptedExercises).length > 0;
  
  // Debug exercise management with more detail
  console.log('TrainingSessionContent: Exercise count:', Object.keys(exercises).length);
  console.log('TrainingSessionContent: Exercise names:', Object.keys(exercises));
  console.log('TrainingSessionContent: isAddExerciseSheetOpen:', isAddExerciseSheetOpen);
  console.log('TrainingSessionContent: Focused exercise:', focusedExercise);
  console.log('TrainingSessionContent: handleAddExercise availability:', typeof handleAddExercise === 'function');

  return (
    <TrainingSessionLayout
      focusedExercise={safeFocusedExercise}
      elapsedTime={elapsedTime}
      completedSets={completedSets}
      totalSets={totalSets}
      workoutStatus={workoutStatus}
      isRecoveryMode={!!workoutId}
      saveProgress={0 as any} // Fixed: properly cast as SaveProgress or use 0 directly
      onRetrySave={handleAttemptRecovery}
      onAddExercise={handleOpenAddExercise}
      metricsPanel={
        <WorkoutMetricsPanel
          elapsedTime={elapsedTime}
          exerciseCount={exerciseCount}
          completedSets={completedSets}
          totalSets={totalSets}
          restTimerActive={restTimerActive}
          currentRestTime={currentRestTime}
          onManualRestStart={handleShowRestTimer}
          onRestTimerComplete={handleRestTimerComplete}
          onRestTimerReset={triggerRestTimerReset}
          restTimerResetSignal={restTimerResetSignal}
          focusedExercise={safeFocusedExercise}
          onAddExercise={handleOpenAddExercise}
        />
      }
    >
      {/* Test button for direct exercise addition */}
      <DirectAddExerciseButton onAddExercise={enhancedHandleAddExercise} />
      
      {/* Timer Components */}
      <TrainingSessionTimers
        showRestTimerModal={showRestTimerModal}
        showEnhancedRestTimer={showEnhancedRestTimer}
        currentRestTime={currentRestTime}
        lastCompletedExercise={lastCompletedExercise ? safeRenderableExercise(lastCompletedExercise) : null}
        nextSetDetails={getNextSetDetails()}
        nextSetRecommendation={null}
        motivationalMessage={""}
        volumeStats={""}
        onClose={() => setShowRestTimerModal(false)}
        onRestTimerComplete={handleRestTimerComplete}
        setRestTimerActive={setRestTimerActive}
        setShowEnhancedRestTimer={setShowEnhancedRestTimer}
        setShowRestTimerModal={setShowRestTimerModal}
        setPostSetFlow={(flow) => setPostSetFlow(flow as PostSetFlowState)}
      />
      
      {/* Exercise List */}
      <ExerciseListWrapper 
        adaptedExercises={adaptedExercises}
        safeActiveExercise={safeActiveExercise} 
        safeFocusedExercise={safeFocusedExercise}
        nextExerciseName={nextExerciseName}
        onFinishWorkout={onFinishWorkoutClick}
        isSaving={isSaving}
        onOpenAddExercise={handleOpenAddExercise}
      />
      
      {/* Action Buttons - only show on mobile */}
      <TrainingActionButtons
        onFinishWorkout={onFinishWorkoutClick}
        isSaving={isSaving}
        onOpenAddExercise={handleOpenAddExercise}
        hasExercises={hasExercises}
        className="md:hidden"
        showOnMobile={true}
      />
      
      {/* Only show debugger in development */}
      {showDebugger && <SetsDebugger />}
      
      {/* Exercise Completion Confirmation */}
      <ExerciseCompletionConfirmation
        isOpen={showCompletionConfirmation}
        exerciseName={completedExerciseName ? safeRenderableExercise(completedExerciseName) : ''}
        onClose={() => {
          setShowCompletionConfirmation(false);
          if (focusedExercise === completedExerciseName) {
            setFocusedExercise(null);
          }
        }}
        onNextExercise={handleNextExercise}
        hasNext={!!nextExerciseName}
      />

      {/* Floating Action Button for Adding Sets */}
      <ExerciseFAB 
        visible={!!focusedExercise && !showRestTimerModal && !showEnhancedRestTimer}
        onAddSet={handleAddSetToFocused}
        position="bottom-center"
      />

      {/* Sheets - Now explicitly pass all required props and handlers */}
      <TrainingSessionSheets 
        isAddExerciseSheetOpen={isAddExerciseSheetOpen}
        setIsAddExerciseSheetOpen={setIsAddExerciseSheetOpen}
        isRatingSheetOpen={isRatingSheetOpen}
        setIsRatingSheetOpen={setIsRatingSheetOpen}
        handleAddExercise={enhancedHandleAddExercise} // Use our enhanced handler with logging
        handleSubmitRating={handleSubmitRating}
        trainingConfig={trainingConfig}
        lastCompletedExercise={lastCompletedExercise}
        lastCompletedSetIndex={lastCompletedSetIndex}
      />
    </TrainingSessionLayout>
  );
};
