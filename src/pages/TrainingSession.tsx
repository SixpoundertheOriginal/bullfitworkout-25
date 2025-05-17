
import React from "react";
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
    setShowEnhancedRestTimer
  } = useTrainingSession();

  // Initialize the workout timer
  useWorkoutTimer();

  if (loadingExercises) {
    return <TrainingSessionLoading />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white pt-16 pb-6">
      <main className="flex-1 overflow-auto">
        <div className="mx-auto py-6 pb-6">
          <div className="relative">
            <WorkoutSessionHeader
              elapsedTime={elapsedTime}
              exerciseCount={exerciseCount}
              completedSets={completedSets}
              totalSets={totalSets}
              workoutStatus={workoutStatus}
              isRecoveryMode={!!workoutId}
              saveProgress={0}
              onRetrySave={() => workoutId && attemptRecovery()}
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
              setPostSetFlow={setPostSetFlow}
            />
          </div>
          
          <div className="mt-6">
            <ExerciseList
              exercises={exercises}
              activeExercise={activeExercise}
              focusedExercise={focusedExercise}
              onAddSet={handleAddSet}
              onCompleteSet={handleCompleteSet}
              onDeleteExercise={deleteExercise}
              onRemoveSet={(name, i) => {
                handleSetExercises(prev => {
                  const updated = { ...prev };
                  updated[name] = prev[name].filter((_, idx) => idx !== i);
                  return updated;
                });
              }}
              onEditSet={(name, i) => {
                handleSetExercises(prev => {
                  const updated = { ...prev };
                  updated[name] = prev[name].map((s, idx) => idx === i ? { ...s, isEditing: true } : s);
                  return updated;
                });
              }}
              onSaveSet={(name, i) => {
                handleSetExercises(prev => {
                  const updated = { ...prev };
                  updated[name] = prev[name].map((s, idx) => idx === i ? { ...s, isEditing: false } : s);
                  return updated;
                });
              }}
              onWeightChange={(name, i, v) => {
                handleSetExercises(prev => {
                  const updated = { ...prev };
                  updated[name] = prev[name].map((s, idx) => idx === i ? { ...s, weight: +v || 0 } : s);
                  return updated;
                });
              }}
              onRepsChange={(name, i, v) => {
                handleSetExercises(prev => {
                  const updated = { ...prev };
                  updated[name] = prev[name].map((s, idx) => idx === i ? { ...s, reps: parseInt(v) || 0 } : s);
                  return updated;
                });
              }}
              onRestTimeChange={(name, i, v) => {
                handleSetExercises(prev => {
                  const updated = { ...prev };
                  updated[name] = prev[name].map((s, idx) => idx === i ? { ...s, restTime: parseInt(v) || 60 } : s);
                  return updated;
                });
              }}
              onWeightIncrement={(name, i, inc) => {
                handleSetExercises(prev => {
                  const updated = { ...prev };
                  const set = prev[name][i];
                  updated[name] = prev[name].map((s, idx) => 
                    idx === i ? { ...s, weight: Math.max(0, (set.weight || 0) + inc) } : s
                  );
                  return updated;
                });
              }}
              onRepsIncrement={(name, i, inc) => {
                handleSetExercises(prev => {
                  const updated = { ...prev };
                  const set = prev[name][i];
                  updated[name] = prev[name].map((s, idx) => 
                    idx === i ? { ...s, reps: Math.max(0, (set.reps || 0) + inc) } : s
                  );
                  return updated;
                });
              }}
              onRestTimeIncrement={(name, i, inc) => {
                handleSetExercises(prev => {
                  const updated = { ...prev };
                  const set = prev[name][i];
                  updated[name] = prev[name].map((s, idx) => 
                    idx === i ? { ...s, restTime: Math.max(0, (set.restTime || 60) + inc) } : s
                  );
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
