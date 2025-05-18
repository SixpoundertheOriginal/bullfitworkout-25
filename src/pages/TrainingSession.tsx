
import React, { useEffect, useCallback } from 'react';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';
import { useExercises } from "@/hooks/useExercises";
import { WorkoutSessionHeader } from "@/components/training/WorkoutSessionHeader";
import { ExerciseList } from "@/components/training/ExerciseList";
import { AddExerciseSheet } from "@/components/training/AddExerciseSheet";
import { PostSetRatingSheet } from "@/components/training/PostSetRatingSheet";
import { ExerciseCompletionConfirmation } from "@/components/training/ExerciseCompletionConfirmation";
import { TrainingSessionLoading } from "@/components/training/TrainingSessionLoading";
import { TrainingSessionTimers } from "@/components/training/TrainingSessionTimers";
import { useTrainingSession } from "@/hooks/useTrainingSession";
import { SetsDebugger } from "@/components/training/SetsDebugger";
import { ExerciseFAB } from "@/components/training/ExerciseFAB";
import { adaptExerciseSets } from "@/utils/exerciseAdapter";

const TrainingSessionPage = () => {
  const { isLoading: loadingExercises } = useExercises();
  const {
    // State
    exercises,
    activeExercise,
    elapsedTime,
    hasExercises,
    exerciseCount,
    completedSets,
    totalSets,
    workoutStatus,
    workoutId,
    restTimerActive,
    isSaving,
    saveStatus,
    showRestTimerModal,
    showEnhancedRestTimer,
    restTimerResetSignal,
    currentRestTime,
    isAddExerciseSheetOpen,
    setIsAddExerciseSheetOpen,
    focusedExercise,
    showCompletionConfirmation,
    completedExerciseName,
    nextExerciseName,
    isRatingSheetOpen,
    setIsRatingSheetOpen,
    postSetFlow,
    lastCompletedExercise,
    lastCompletedSetIndex,
    trainingConfig,
    
    // Methods
    handleAddSet,
    handleAddExercise,
    handleShowRestTimer,
    handleRestTimerComplete,
    handleSubmitRating,
    handleFocusExercise,
    handleFinishWorkout,
    attemptRecovery,
    handleNextExercise,
    handleCompleteExercise,
    handleSetExercises,
    handleCompleteSet,
    deleteExercise,
    setFocusedExercise,
    triggerRestTimerReset,
    getNextSetDetails,
    
    // UI state setters
    setShowCompletionConfirmation,
    setPostSetFlow,
    setRestTimerActive,
    setShowEnhancedRestTimer,
    setShowRestTimerModal
  } = useTrainingSession();

  // Initialize the workout timer
  useWorkoutTimer();
  
  // Debug logging
  useEffect(() => {
    console.log("Training session exercises state:", exercises);
  }, [exercises]);

  if (loadingExercises) {
    return <TrainingSessionLoading />;
  }
  
  // Function to handle adding a set to the focused exercise
  const handleAddSetToFocused = () => {
    if (focusedExercise) {
      handleAddSet(focusedExercise);
    }
  };

  // Determine if we should show the development debugger
  const showDebugger = process.env.NODE_ENV !== 'production';

  // Adapt exercises to the component-friendly format
  const adaptedExercises = adaptExerciseSets(exercises);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white pt-16 pb-4">
      <main className="flex-1 overflow-auto">
        <div className="mx-auto pb-4">
          <div className="relative">
            <WorkoutSessionHeader
              elapsedTime={elapsedTime}
              exerciseCount={exerciseCount}
              completedSets={completedSets}
              totalSets={totalSets}
              workoutStatus={workoutStatus}
              isRecoveryMode={!!workoutId}
              saveProgress={0}
              onRetrySave={attemptRecovery} // Fixed: Pass the function directly
              onResetWorkout={() => {}}
              restTimerActive={restTimerActive}
              onRestTimerComplete={handleRestTimerComplete}
              onShowRestTimer={handleShowRestTimer}
              onRestTimerReset={triggerRestTimerReset}
              restTimerResetSignal={restTimerResetSignal}
              currentRestTime={currentRestTime}
              focusedExercise={focusedExercise}
            />
            
            {/* Timer Components */}
            <TrainingSessionTimers
              showRestTimerModal={showRestTimerModal}
              showEnhancedRestTimer={showEnhancedRestTimer}
              currentRestTime={currentRestTime}
              lastCompletedExercise={lastCompletedExercise}
              nextSetDetails={getNextSetDetails()}
              nextSetRecommendation={null}
              motivationalMessage={""}
              volumeStats={""}
              onClose={() => setShowRestTimerModal(false)}
              onRestTimerComplete={handleRestTimerComplete}
              setRestTimerActive={setRestTimerActive}
              setShowEnhancedRestTimer={setShowEnhancedRestTimer}
              setShowRestTimerModal={setShowRestTimerModal}
              setPostSetFlow={setPostSetFlow}
            />
          </div>
          
          <div className="mt-3 px-3 sm:px-4">
            <ExerciseList
              exercises={adaptedExercises}
              activeExercise={activeExercise}
              focusedExercise={focusedExercise}
              onAddSet={handleAddSet}
              onCompleteSet={handleCompleteSet}
              onDeleteExercise={deleteExercise}
              onRemoveSet={(name, i) => {
                console.log(`Removing set ${i} from ${name}`);
                handleSetExercises(prev => {
                  const updated = { ...prev };
                  updated[name] = prev[name].filter((_, idx) => idx !== i);
                  return updated;
                });
              }}
              onEditSet={(name, i) => {
                console.log(`Setting edit mode for set ${i} of ${name}`);
                handleSetExercises(prev => {
                  const updated = { ...prev };
                  updated[name] = prev[name].map((s, idx) => idx === i ? { ...s, isEditing: true } : s);
                  return updated;
                });
              }}
              onSaveSet={(name, i) => {
                console.log(`Saving set ${i} of ${name}`);
                handleSetExercises(prev => {
                  const updated = { ...prev };
                  updated[name] = prev[name].map((s, idx) => idx === i ? { ...s, isEditing: false } : s);
                  return updated;
                });
              }}
              onWeightChange={(name, i, v) => {
                console.log(`Changing weight for set ${i} of ${name} to ${v}`);
                handleSetExercises(prev => {
                  const updated = { ...prev };
                  const currentSets = [...prev[name]];
                  currentSets[i] = { ...currentSets[i], weight: parseFloat(v) || 0 };
                  updated[name] = currentSets;
                  return updated;
                });
              }}
              onRepsChange={(name, i, v) => {
                console.log(`Changing reps for set ${i} of ${name} to ${v}`);
                handleSetExercises(prev => {
                  const updated = { ...prev };
                  const currentSets = [...prev[name]];
                  currentSets[i] = { ...currentSets[i], reps: parseInt(v) || 0 };
                  updated[name] = currentSets;
                  return updated;
                });
              }}
              onRestTimeChange={(name, i, v) => {
                console.log(`Changing rest time for set ${i} of ${name} to ${v}`);
                handleSetExercises(prev => {
                  const updated = { ...prev };
                  const currentSets = [...prev[name]];
                  currentSets[i] = { ...currentSets[i], restTime: parseInt(v) || 60 };
                  updated[name] = currentSets;
                  return updated;
                });
              }}
              onWeightIncrement={(name, i, inc) => {
                handleSetExercises(prev => {
                  const updated = { ...prev };
                  const currentSets = [...prev[name]];
                  const currentWeight = currentSets[i].weight || 0;
                  currentSets[i] = { ...currentSets[i], weight: Math.max(0, currentWeight + inc) };
                  updated[name] = currentSets;
                  return updated;
                });
              }}
              onRepsIncrement={(name, i, inc) => {
                handleSetExercises(prev => {
                  const updated = { ...prev };
                  const currentSets = [...prev[name]];
                  const currentReps = currentSets[i].reps || 0;
                  currentSets[i] = { ...currentSets[i], reps: Math.max(0, currentReps + inc) };
                  updated[name] = currentSets;
                  return updated;
                });
              }}
              onRestTimeIncrement={(name, i, inc) => {
                handleSetExercises(prev => {
                  const updated = { ...prev };
                  const currentSets = [...prev[name]];
                  const currentRest = currentSets[i].restTime || 60;
                  currentSets[i] = { ...currentSets[i], restTime: Math.max(0, currentRest + inc) };
                  updated[name] = currentSets;
                  return updated;
                });
              }}
              onShowRestTimer={handleShowRestTimer}
              onResetRestTimer={triggerRestTimerReset}
              onFocusExercise={handleFocusExercise}
              onOpenAddExercise={() => setIsAddExerciseSheetOpen(true)}
              onFinishWorkout={handleFinishWorkout}
              isSaving={isSaving || saveStatus === 'saving'}
              onNextExercise={handleNextExercise}
              hasMoreExercises={!!nextExerciseName}
              setExercises={handleSetExercises}
            />
            
            {/* Only show debugger in development */}
            {showDebugger && <SetsDebugger />}
          </div>
        </div>
      </main>

      {/* Exercise Completion Confirmation */}
      <ExerciseCompletionConfirmation
        isOpen={showCompletionConfirmation}
        exerciseName={completedExerciseName || ''}
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
      <AddExerciseSheet
        open={isAddExerciseSheetOpen}
        onOpenChange={setIsAddExerciseSheetOpen}
        onSelectExercise={handleAddExercise}
        trainingType={trainingConfig?.trainingType}
      />
      
      <PostSetRatingSheet
        open={isRatingSheetOpen}
        onOpenChange={(open) => {
          setIsRatingSheetOpen(open);
          if (!open) setPostSetFlow('idle');
        }}
        onSubmitRating={handleSubmitRating}
        exerciseName={lastCompletedExercise || ''}
        setDetails={lastCompletedExercise && lastCompletedSetIndex !== null && exercises[lastCompletedExercise]
          ? exercises[lastCompletedExercise][lastCompletedSetIndex]
          : undefined}
      />
    </div>
  );
};

export default TrainingSessionPage;
