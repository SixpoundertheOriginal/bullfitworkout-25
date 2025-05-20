import React, { useCallback, useEffect } from 'react';
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
import { useWorkoutStore } from '@/store/workout/store';
import { toast } from "@/hooks/use-toast";
import { EmptyWorkoutState } from "./EmptyWorkoutState";
import { StopWorkoutButton } from "../StopWorkoutButton";
import { validateWorkoutState } from '@/store/workout/actions';
import { FloatingAddExerciseButton } from "@/components/training/FloatingAddExerciseButton";
import { Button } from "@/components/ui/button";

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
    resetSession,
    
    // UI state setters
    setShowCompletionConfirmation,
    setFocusedExercise,
    setShowRestTimerModal,
    setShowEnhancedRestTimer,
    setRestTimerActive,
    setPostSetFlow
  } = useTrainingSession();

  // Access the store directly for checking current state
  const workoutStore = useWorkoutStore();
  
  // Run workout validation on component mount
  useEffect(() => {
    console.log("TrainingSessionContent: Validating workout state on mount");
    // Short delay to ensure store is fully loaded
    const timer = setTimeout(() => {
      validateWorkoutState();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Detect inconsistent state and offer to fix it
  useEffect(() => {
    const exerciseKeys = Object.keys(exercises);
    
    // Check if workout is active but has no exercises
    if (workoutStatus === 'active' && exerciseKeys.length === 0) {
      console.warn("TrainingSessionContent: Detected inconsistent state - active workout with no exercises");
      toast.error("Workout data inconsistency detected", {
        description: "The workout appears active but contains no exercises.",
        action: {
          label: "Reset Workout",
          onClick: () => resetSession()
        }
      });
    }
  }, [workoutStatus, exercises, resetSession]);
  
  // Wrap handleAddExercise with useCallback and add logging
  const enhancedHandleAddExercise = useCallback((exerciseName: string) => {
    console.log('TrainingSessionContent: enhancedHandleAddExercise called with', exerciseName);
    
    // If empty string is passed, just open the exercise sheet instead
    if (!exerciseName) {
      console.log('TrainingSessionContent: Opening add exercise sheet');
      setIsAddExerciseSheetOpen(true);
      return;
    }
    
    // Log the current state of exercises before adding
    console.log('TrainingSessionContent: Current exercises before adding:', Object.keys(exercises));
    
    // Call the original handler from useTrainingSession
    handleAddExercise(exerciseName);
    
    // Check if the exercise was added after a delay
    setTimeout(() => {
      console.log('TrainingSessionContent: Exercises after adding (timeout check):', 
        Object.keys(workoutStore.exercises));
    }, 500);
  }, [handleAddExercise, exercises, setIsAddExerciseSheetOpen, workoutStore.exercises]);
  
  // Handle stopping/ending the workout - simplified to use resetSession directly
  const handleStopWorkout = useCallback(() => {
    resetSession();
  }, [resetSession]);
  
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
  
  // Debug exercise management with more detail
  console.log('TrainingSessionContent: Exercise count:', Object.keys(exercises).length);
  console.log('TrainingSessionContent: Exercise names:', Object.keys(exercises));
  console.log('TrainingSessionContent: isAddExerciseSheetOpen:', isAddExerciseSheetOpen);
  console.log('TrainingSessionContent: Focused exercise:', focusedExercise);

  return (
    <TrainingSessionLayout
      focusedExercise={safeFocusedExercise}
      elapsedTime={elapsedTime}
      completedSets={completedSets}
      totalSets={totalSets}
      workoutStatus={workoutStatus}
      isRecoveryMode={!!workoutId}
      saveProgress={0 as any}
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
      {/* Stop Workout Button - Always show at the top right for easy access */}
      <div className="absolute top-2 right-2 z-10">
        <StopWorkoutButton onStopWorkout={handleStopWorkout} />
      </div>

      {/* New Exercise Button for empty state */}
      {!hasExercises && (
        <EmptyWorkoutState onAddExercise={enhancedHandleAddExercise} />
      )}
      
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
      
      {/* Exercise List - only show if has exercises */}
      {hasExercises && (
        <ExerciseListWrapper 
          adaptedExercises={adaptedExercises}
          safeActiveExercise={safeActiveExercise} 
          safeFocusedExercise={safeFocusedExercise}
          nextExerciseName={nextExerciseName}
          onFinishWorkout={onFinishWorkoutClick}
          isSaving={isSaving}
          onOpenAddExercise={handleOpenAddExercise}
        />
      )}
      
      {/* Action Buttons - only show on mobile and if has exercises */}
      {hasExercises && (
        <TrainingActionButtons
          onFinishWorkout={onFinishWorkoutClick}
          isSaving={isSaving}
          onOpenAddExercise={handleOpenAddExercise}
          hasExercises={hasExercises}
          className="md:hidden"
          showOnMobile={true}
        />
      )}
      
      {/* Enhanced debugger in development that shows reset button */}
      {showDebugger && (
        <>
          <SetsDebugger />
          <div className="fixed bottom-4 left-4 z-50">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                console.log("Manually triggering validation");
                validateWorkoutState();
              }}
              className="text-xs"
            >
              Validate State
            </Button>
          </div>
        </>
      )}
      
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

      {/* Floating Action Button for Adding Sets - only show if focused on an exercise */}
      {focusedExercise && (
        <ExerciseFAB 
          visible={!!focusedExercise && !showRestTimerModal && !showEnhancedRestTimer}
          onAddSet={handleAddSetToFocused}
          position="bottom-center"
        />
      )}

      {/* New engaging FloatingAddExerciseButton - show when we have exercises and not focused on one */}
      {hasExercises && !focusedExercise && !showRestTimerModal && !showEnhancedRestTimer && (
        <FloatingAddExerciseButton
          onClick={handleOpenAddExercise}
        />
      )}

      {/* Sheets - Now explicitly pass all required props and handlers */}
      <TrainingSessionSheets 
        isAddExerciseSheetOpen={isAddExerciseSheetOpen}
        setIsAddExerciseSheetOpen={setIsAddExerciseSheetOpen}
        isRatingSheetOpen={isRatingSheetOpen}
        setIsRatingSheetOpen={setIsRatingSheetOpen}
        handleAddExercise={enhancedHandleAddExercise}
        handleSubmitRating={handleSubmitRating}
        trainingConfig={trainingConfig}
        lastCompletedExercise={lastCompletedExercise}
        lastCompletedSetIndex={lastCompletedSetIndex}
      />
    </TrainingSessionLayout>
  );
};

// Add missing Button import
import { Button } from "@/components/ui/button";
