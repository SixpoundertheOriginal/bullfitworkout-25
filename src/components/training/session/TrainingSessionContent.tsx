
import React from 'react';
import { TrainingSessionLayout } from './layout/TrainingSessionLayout';
import { ExerciseListWrapper } from './ExerciseListWrapper';
import { TrainingSessionSheets } from './TrainingSessionSheets';
import { TrainingActionButtons } from './actions/TrainingActionButtons';
import { WorkoutMetricsPanel } from './metrics/WorkoutMetricsPanel';
import { EmptyWorkoutState } from './EmptyWorkoutState';
import { FloatingAddExerciseButton } from '../FloatingAddExerciseButton';
import { SetsDebugger } from '../SetsDebugger';
import { useTrainingSessionState } from '@/hooks/training-session/useTrainingSessionState';
import { useWorkoutStore } from '@/store/workout';
import { useTrainingSessionData } from '@/hooks/training-session/useTrainingSessionData';

interface TrainingSessionContentProps {
  onFinishWorkoutClick: () => void;
  isSaving?: boolean;
  onOpenAddExercise?: () => void;
}

export const TrainingSessionContent: React.FC<TrainingSessionContentProps> = ({
  onFinishWorkoutClick,
  isSaving = false,
  onOpenAddExercise,
}) => {
  const {
    exercises,
    setIsAddExerciseSheetOpen,
    isAddExerciseSheetOpen,
    isRatingSheetOpen,
    setIsRatingSheetOpen,
    trainingConfig,
    postSetFlow,
    lastCompletedExercise,
    lastCompletedSetIndex,
    elapsedTime,
    activeExercise,
    focusedExercise
  } = useTrainingSessionState();
  
  // Use the hook to get computed data from exercises
  const {
    hasExercises,
    exerciseCount,
    totalSets,
    completedSets,
    nextExerciseName
  } = useTrainingSessionData(exercises, focusedExercise);

  // Get additional workout state info to determine if we should show empty state
  const { isActive } = useWorkoutStore();

  // Need to convert exercises to adaptedExercises
  const adaptedExercises = React.useMemo(() => {
    return exercises;
  }, [exercises]);
  
  const handleOpenAddExerciseSheet = () => {
    console.log('TrainingSessionContent: Opening add exercise sheet');
    setIsAddExerciseSheetOpen(true);
  };

  // Handler for adding an exercise after selection
  const handleAddExercise = (exerciseName: string) => {
    console.log('TrainingSessionContent: Adding exercise', exerciseName);
    // Here you would typically add the exercise to the workout
    // For example by calling a function from your workout store
    const { addExerciseToWorkout } = require('@/store/workout/actions');
    addExerciseToWorkout(exerciseName);
    
    // Close the sheet afterward
    setIsAddExerciseSheetOpen(false);
  };

  // Handler for when the rating is submitted
  const handleSubmitRating = (rpe: number) => {
    console.log('Submitting RPE rating:', rpe);
    const { submitSetRating } = require('@/store/workout/actions');
    submitSetRating(rpe);
    
    setIsRatingSheetOpen(false);
  };
  
  return (
    <TrainingSessionLayout>
      <WorkoutMetricsPanel 
        elapsedTime={elapsedTime}
        exerciseCount={exerciseCount}
        completedSets={completedSets}
        totalSets={totalSets}
      />
      
      {hasExercises ? (
        <ExerciseListWrapper 
          adaptedExercises={adaptedExercises}
          safeActiveExercise={activeExercise}
          safeFocusedExercise={focusedExercise}
          nextExerciseName={nextExerciseName || ""}
          exerciseCount={exerciseCount}
          isComplete={false}
          totalSets={totalSets}
          completedSets={completedSets}
          onFinishWorkout={onFinishWorkoutClick}
          isSaving={isSaving}
          onOpenAddExercise={onOpenAddExercise || handleOpenAddExerciseSheet}
        />
      ) : (
        <EmptyWorkoutState 
          onAddExerciseClick={handleOpenAddExerciseSheet}
        />
      )}

      <TrainingActionButtons 
        onFinishWorkout={onFinishWorkoutClick}
        isSubmitting={isSaving}
        exerciseCount={exerciseCount}
        completedSets={completedSets}
      />
      
      <FloatingAddExerciseButton
        onClick={onOpenAddExercise || handleOpenAddExerciseSheet}
        className="z-[90]" // Increased z-index to ensure visibility
      />

      <TrainingSessionSheets
        isAddExerciseSheetOpen={isAddExerciseSheetOpen}
        setIsAddExerciseSheetOpen={setIsAddExerciseSheetOpen}
        isRatingSheetOpen={isRatingSheetOpen}
        setIsRatingSheetOpen={setIsRatingSheetOpen}
        handleSubmitRating={handleSubmitRating}
        trainingConfig={trainingConfig}
        lastCompletedExercise={lastCompletedExercise}
        lastCompletedSetIndex={lastCompletedSetIndex}
        handleAddExercise={handleAddExercise}
      />
      
      {/* Only visible in dev environment */}
      <SetsDebugger />
    </TrainingSessionLayout>
  );
};

