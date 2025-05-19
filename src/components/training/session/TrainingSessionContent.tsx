
import React from 'react';
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
    
    // Methods
    handleRestTimerComplete,
    handleShowRestTimer,
    handleNextExercise,
    handleFocusExercise,
    triggerRestTimerReset,
    getNextSetDetails,
    attemptRecovery,
    
    // UI state setters
    setShowCompletionConfirmation,
    setFocusedExercise,
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
  const handleAddSetToFocused = () => {
    if (focusedExercise) {
      const { handleAddSet } = useTrainingSession();
      const safeExerciseName = safeRenderableExercise(focusedExercise);
      handleAddSet(safeExerciseName);
    }
  };

  // Create a wrapper for the attemptRecovery function with the required signature
  const handleAttemptRecovery = () => {
    if (workoutId) {
      // Pass all required arguments for the AttemptRecoveryFn signature
      attemptRecovery(workoutId, 'manual', {});
    }
  };

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
        onClose={() => {
          const { setShowRestTimerModal } = useTrainingSession();
          setShowRestTimerModal(false);
        }}
        onRestTimerComplete={handleRestTimerComplete}
        setRestTimerActive={(active) => {
          const { setRestTimerActive } = useTrainingSession();
          setRestTimerActive(active);
        }}
        setShowEnhancedRestTimer={(show) => {
          const { setShowEnhancedRestTimer } = useTrainingSession();
          setShowEnhancedRestTimer(show);
        }}
        setShowRestTimerModal={(show) => {
          const { setShowRestTimerModal } = useTrainingSession();
          setShowRestTimerModal(show);
        }}
        setPostSetFlow={(flow) => {
          const { setPostSetFlow } = useTrainingSession();
          // Fix type error by using the correct PostSetFlowState type
          setPostSetFlow(flow as PostSetFlowState);
        }}
      />
      
      {/* Exercise List */}
      <ExerciseListWrapper 
        adaptedExercises={adaptedExercises}
        safeActiveExercise={safeActiveExercise} 
        safeFocusedExercise={safeFocusedExercise}
        nextExerciseName={nextExerciseName}
        onFinishWorkout={onFinishWorkoutClick}
        isSaving={isSaving}
      />
      
      {/* Action Buttons */}
      <TrainingActionButtons
        onFinishWorkout={onFinishWorkoutClick}
        isSaving={isSaving}
        onOpenAddExercise={() => {
          const { setIsAddExerciseSheetOpen } = useTrainingSession();
          setIsAddExerciseSheetOpen(true);
        }}
        hasExercises={hasExercises}
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
