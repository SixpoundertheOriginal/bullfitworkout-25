
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
    completedSets,
    totalSets,
    adaptedExercises,
    activeExercise,
    focusedExercise,
    handleAddExercise,
    handleFinishWorkout,
    exerciseCount
  } = useTrainingSessionState();

  // Get additional workout state info to determine if we should show empty state
  const { isActive } = useWorkoutStore();
  
  const hasExercises = exerciseCount > 0;
  
  const handleOpenAddExerciseSheet = () => {
    console.log('TrainingSessionContent: Opening add exercise sheet');
    setIsAddExerciseSheetOpen(true);
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
        isActive={isActive}
        lastActivity={Date.now()}
        workoutId={null}
        workoutStatus="active"
        trainingConfig={trainingConfig}
      />
      
      {hasExercises ? (
        <ExerciseListWrapper 
          adaptedExercises={adaptedExercises}
          safeActiveExercise={activeExercise}
          safeFocusedExercise={focusedExercise}
          nextExerciseName=""
          handleAddExercise={handleAddExercise}
          exerciseCount={exerciseCount}
          isComplete={false}
          totalSets={totalSets}
          completedSets={completedSets}
        />
      ) : (
        <EmptyWorkoutState 
          onAddExerciseClick={handleOpenAddExerciseSheet}
          onTemplateSelect={handleAddExercise}
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
        handleAddExercise={handleAddExercise}
        handleSubmitRating={handleSubmitRating}
        trainingConfig={trainingConfig}
        lastCompletedExercise={lastCompletedExercise}
        lastCompletedSetIndex={lastCompletedSetIndex}
      />
      
      {/* Only visible in dev environment */}
      <SetsDebugger />
    </TrainingSessionLayout>
  );
};
