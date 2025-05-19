import React, { useEffect, useState } from 'react';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';
import { useExercises } from "@/hooks/useExercises";
import { WorkoutSessionHeader } from "@/components/training/WorkoutSessionHeader";
import { ExerciseList } from "@/components/training/ExerciseList";
import { AddExerciseSheet } from "@/components/training/AddExerciseSheet";
import { PostSetRatingSheet } from "@/components/training/PostSetRatingSheet";
import { ExerciseCompletionConfirmation } from "@/components/training/ExerciseCompletionConfirmation";
import { TrainingSessionLoading } from "@/components/training/TrainingSessionLoading";
import { TrainingSessionTimers } from "@/components/training/TrainingSessionTimers";
import { useTrainingSession } from "@/hooks/training-session";
import { SetsDebugger } from "@/components/training/SetsDebugger";
import { ExerciseFAB } from "@/components/training/ExerciseFAB";
import { adaptExerciseSets, safeRenderableExercise } from "@/utils/exerciseAdapter";
import { WorkoutExercises } from '@/store/workout/types';
import { toast } from "@/hooks/use-toast";
import { WorkoutCompletion } from "@/components/training/WorkoutCompletion";

const TrainingSessionPage = () => {
  const { isLoading: loadingExercises } = useExercises();
  const [showCompletion, setShowCompletion] = useState(false);
  
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
    resetSession,
    
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
    
    // Check for potential object keys that could cause rendering issues
    const objectKeys = Object.keys(exercises || {}).filter(key => typeof key !== 'string' || key.includes('[object Object]'));
    if (objectKeys.length > 0) {
      console.warn('Found problematic exercise keys that may cause rendering issues:', objectKeys);
    }
  }, [exercises]);

  if (loadingExercises) {
    return <TrainingSessionLoading />;
  }

  // Wrapper for finish workout
  const handleFinishWorkoutClick = async () => {
    try {
      console.log("Finish workout clicked, exercises:", Object.keys(exercises));
      
      if (!hasExercises || Object.keys(exercises).length === 0) {
        toast({
          title: "No exercises added",
          description: "Please add at least one exercise before finishing your workout.",
          variant: "destructive"
        });
        return;
      }
      
      // Show completion screen
      setShowCompletion(true);
    } catch (error) {
      console.error("Error while finishing workout:", error);
      toast({
        title: "Error",
        description: "There was an error finishing your workout. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle completion screens
  const handleWorkoutComplete = () => {
    console.log("Saving workout data...");
    handleFinishWorkout()
      .then((result) => {
        console.log("Workout saved with result:", result);
        // Add a small delay to show success message before redirecting
        setTimeout(() => {
          resetSession();
          setShowCompletion(false);
        }, 1000);
      })
      .catch((error) => {
        console.error("Error saving workout:", error);
        toast({
          title: "Error saving workout",
          description: "Please try again",
          variant: "destructive"
        });
      });
  };
  
  // Function to handle adding a set to the focused exercise
  const handleAddSetToFocused = () => {
    if (focusedExercise) {
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
  // This is a critical step to ensure all exercise names are strings
  const adaptedExercises = adaptExerciseSets(exercises);

  // Create type-safe wrappers for passing to components
  const typeSafeHandleSetExercises = (
    exercisesUpdate: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)
  ) => {
    // Type assertion to match the expected signature
    handleSetExercises(exercisesUpdate as WorkoutExercises | ((prev: WorkoutExercises) => WorkoutExercises));
  };

  // Make sure activeExercise is always a safe string
  const safeActiveExercise = activeExercise ? safeRenderableExercise(activeExercise) : null;
  
  // Make sure focusedExercise is always a safe string
  const safeFocusedExercise = focusedExercise ? safeRenderableExercise(focusedExercise) : null;

  // If showing completion modal, render that instead
  if (showCompletion) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white pt-16 pb-4">
        <main className="flex-1 overflow-auto px-4">
          <div className="container max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold my-6 text-center">Workout Complete</h1>
            
            <WorkoutCompletion
              exercises={adaptedExercises}
              duration={elapsedTime}
              intensity={7}
              efficiency={8}
              onComplete={handleWorkoutComplete}
            />
          </div>
        </main>
      </div>
    );
  }

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
              onRetrySave={handleAttemptRecovery}
              onResetWorkout={() => {}}
              restTimerActive={restTimerActive}
              onRestTimerComplete={handleRestTimerComplete}
              onShowRestTimer={handleShowRestTimer}
              onRestTimerReset={triggerRestTimerReset}
              restTimerResetSignal={restTimerResetSignal}
              currentRestTime={currentRestTime}
              focusedExercise={safeFocusedExercise}
            />
            
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
              setPostSetFlow={setPostSetFlow}
            />
          </div>
          
          <div className="mt-3 px-3 sm:px-4">
            <ExerciseList
              exercises={adaptedExercises}
              activeExercise={safeActiveExercise}
              focusedExercise={safeFocusedExercise}
              onAddSet={handleAddSet}
              onCompleteSet={handleCompleteSet}
              onDeleteExercise={deleteExercise}
              onRemoveSet={(name, i) => {
                console.log(`Removing set ${i} from ${name}`);
                typeSafeHandleSetExercises(prev => {
                  const updated = { ...prev };
                  updated[name] = prev[name].filter((_, idx) => idx !== i);
                  return updated;
                });
              }}
              onEditSet={(name, i) => {
                console.log(`Setting edit mode for set ${i} of ${name}`);
                typeSafeHandleSetExercises(prev => {
                  const updated = { ...prev };
                  updated[name] = prev[name].map((s, idx) => idx === i ? { ...s, isEditing: true } : s);
                  return updated;
                });
              }}
              onSaveSet={(name, i) => {
                console.log(`Saving set ${i} of ${name}`);
                typeSafeHandleSetExercises(prev => {
                  const updated = { ...prev };
                  updated[name] = prev[name].map((s, idx) => idx === i ? { ...s, isEditing: false } : s);
                  return updated;
                });
              }}
              onWeightChange={(name, i, v) => {
                console.log(`Changing weight for set ${i} of ${name} to ${v}`);
                typeSafeHandleSetExercises(prev => {
                  const updated = { ...prev };
                  const currentSets = [...prev[name]];
                  currentSets[i] = { ...currentSets[i], weight: parseFloat(v) || 0 };
                  updated[name] = currentSets;
                  return updated;
                });
              }}
              onRepsChange={(name, i, v) => {
                console.log(`Changing reps for set ${i} of ${name} to ${v}`);
                typeSafeHandleSetExercises(prev => {
                  const updated = { ...prev };
                  const currentSets = [...prev[name]];
                  currentSets[i] = { ...currentSets[i], reps: parseInt(v) || 0 };
                  updated[name] = currentSets;
                  return updated;
                });
              }}
              onRestTimeChange={(name, i, v) => {
                console.log(`Changing rest time for set ${i} of ${name} to ${v}`);
                typeSafeHandleSetExercises(prev => {
                  const updated = { ...prev };
                  const currentSets = [...prev[name]];
                  currentSets[i] = { ...currentSets[i], restTime: parseInt(v) || 60 };
                  updated[name] = currentSets;
                  return updated;
                });
              }}
              onWeightIncrement={(name, i, inc) => {
                typeSafeHandleSetExercises(prev => {
                  const updated = { ...prev };
                  const currentSets = [...prev[name]];
                  const currentWeight = currentSets[i].weight || 0;
                  currentSets[i] = { ...currentSets[i], weight: Math.max(0, currentWeight + inc) };
                  updated[name] = currentSets;
                  return updated;
                });
              }}
              onRepsIncrement={(name, i, inc) => {
                typeSafeHandleSetExercises(prev => {
                  const updated = { ...prev };
                  const currentSets = [...prev[name]];
                  const currentReps = currentSets[i].reps || 0;
                  currentSets[i] = { ...currentSets[i], reps: Math.max(0, currentReps + inc) };
                  updated[name] = currentSets;
                  return updated;
                });
              }}
              onRestTimeIncrement={(name, i, inc) => {
                typeSafeHandleSetExercises(prev => {
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
              onFinishWorkout={handleFinishWorkoutClick}  // Use our wrapped function here
              isSaving={isSaving || saveStatus === 'saving'}
              onNextExercise={handleNextExercise}
              hasMoreExercises={!!nextExerciseName}
              setExercises={typeSafeHandleSetExercises}
            />
            
            {/* Only show debugger in development */}
            {showDebugger && <SetsDebugger />}
          </div>
        </div>
      </main>

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
        exerciseName={lastCompletedExercise ? safeRenderableExercise(lastCompletedExercise) : ''}
        setDetails={lastCompletedExercise && lastCompletedSetIndex !== null && exercises[lastCompletedExercise]
          ? exercises[lastCompletedExercise][lastCompletedSetIndex]
          : undefined}
      />
    </div>
  );
};

export default TrainingSessionPage;
