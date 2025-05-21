
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
  } = useTrainingSessionState();

  // Get additional workout state info to determine if we should show empty state
  const { isActive } = useWorkoutStore();
  
  const exerciseCount = Object.keys(exercises).length;
  const hasExercises = exerciseCount > 0;
  
  // Handler for adding an exercise directly or through sheet
  const handleAddExercise = (exerciseName: string) => {
    console.log('TrainingSessionContent: handleAddExercise called with', exerciseName);
    
    // Forward to the workout store action
    const { useTrainingSessionHandlers } = require('@/hooks/training-session');
    const { handleAddExercise: addExercise } = useTrainingSessionHandlers();
    addExercise(exerciseName);
  };
  
  // Handler for when the rating is submitted
  const handleSubmitRating = (rpe: number) => {
    console.log('Submitting RPE rating:', rpe);
    const { submitSetRating } = require('@/store/workout/actions');
    submitSetRating(rpe);
    
    setIsRatingSheetOpen(false);
  };

  const handleOpenAddExerciseSheet = () => {
    console.log('TrainingSessionContent: Opening add exercise sheet');
    setIsAddExerciseSheetOpen(true);
  };
  
  return (
    <TrainingSessionLayout
      workoutMetricsPanel={<WorkoutMetricsPanel />}
    >
      {hasExercises ? (
        <ExerciseListWrapper />
      ) : (
        <EmptyWorkoutState 
          onAddExercise={handleOpenAddExerciseSheet} 
          isActive={isActive}
        />
      )}

      <TrainingActionButtons 
        onFinishWorkoutClick={onFinishWorkoutClick}
        isSubmitting={isSaving}
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
