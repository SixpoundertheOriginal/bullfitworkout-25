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
    
    // Methods
    handleRestTimerComplete,
    handleShowRestTimer,
    handleNextExercise,
    handleFocusExercise,
    triggerRestTimerReset,
    getNextSetDetails,
    attemptRecovery,
    handleAddSet,
    
    // UI state setters
    setShowCompletionConfirmation,
    setFocusedExercise,
    setShowRestTimerModal,
    setShowEnhancedRestTimer,
    setRestTimerActive,
    setPostSetFlow
  } = useTrainingSession();
  
  // Make sure focusedExercise is always a safe string
  const safeFocusedExercise = focusedExercise 
    ? safeRenderableExercise(focusedExercise) 
    : null;
  
  // Make sure activeExercise is always a safe string
  const safeActiveExercise = activeExercise 
    ? safeRenderableExercise(activeExercise) 
    : null;

  // Function to handle adding a set to the focused exercise
  const handleAddSetToFocused = useCallback(() => {
    if (focusedExercise) {
      const safeExerciseName = safeRenderableExercise(focusedExercise);
      handleAddSet(safeExerciseName);
    }
  }, [focusedExercise, handleAddSet]);

  // Function to open add exercise sheet - defined at component level to avoid inline hooks
  const handleOpenAddExercise = useCallback(() => {
    setIsAddExerciseSheetOpen(true);
  }, [setIsAddExerciseSheetOpen]);

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

  return (
    <TrainingSessionLayout
      focusedExercise={safeFocusedExercise}
      elapsedTime={elapsedTime}
      completedSets={completedSets}
      totalSets={totalSets}
      workoutStatus={workoutStatus}
      isRecoveryMode={!!workoutId}
      saveProgress={0}
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
          onAddExercise={handleOpenAddExercise} // Now properly typed
        />
      }
    >
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

      {/* Sheets */}
      <TrainingSessionSheets />
    </TrainingSessionLayout>
  );
};
