
import React from 'react';
import { AddExerciseSheet } from "@/components/training/AddExerciseSheet";
import { PostSetRatingSheet } from '@/components/training/PostSetRatingSheet';
import { ExerciseWizardSheet } from '@/components/exercises/ExerciseWizardSheet';
import { safeRenderableExercise } from '@/utils/exerciseAdapter';
import { ExerciseSet } from '@/store/workout/types';

// Create a proper interface for the component props
interface TrainingSessionSheetsProps {
  // Sheet open state
  isAddExerciseSheetOpen: boolean;
  isRatingSheetOpen: boolean;
  
  // Sheet state handlers
  setIsAddExerciseSheetOpen: (open: boolean) => void;
  setIsRatingSheetOpen: (open: boolean) => void;
  
  // Exercise management - MUST match the parent's handler signatures
  handleAddExercise: (exerciseName: string) => void;
  handleSubmitRating: (rpe: number) => void;
  
  // Training configuration
  trainingConfig: any;
  
  // Last completed exercise data
  lastCompletedExercise: string | null;
  lastCompletedSetIndex: number | null;
}

export const TrainingSessionSheets: React.FC<TrainingSessionSheetsProps> = ({
  isAddExerciseSheetOpen,
  setIsAddExerciseSheetOpen,
  isRatingSheetOpen,
  setIsRatingSheetOpen,
  handleAddExercise,
  handleSubmitRating,
  trainingConfig,
  lastCompletedExercise,
  lastCompletedSetIndex
}) => {
  // Get the last completed exercise details for the rating sheet
  const exerciseName = lastCompletedExercise || '';
  const setDetails = lastCompletedExercise && typeof lastCompletedSetIndex === 'number' ? 
    {
      set_number: lastCompletedSetIndex + 1,
      weight: 0,
      reps: 0
    } : undefined;
    
  // This is the critical handler that wasn't working
  const handleSelectExercise = (exerciseName: string) => {
    // Debug log to verify this handler is being called
    console.log('TrainingSessionSheets: handleSelectExercise called with', exerciseName);
    
    // Call the parent's handleAddExercise function (from useTrainingSession hook)
    handleAddExercise(exerciseName);
    
    // Close the sheet after selecting the exercise
    setIsAddExerciseSheetOpen(false);
  };

  return (
    <>
      {/* Sheet for adding new exercises */}
      <AddExerciseSheet
        open={isAddExerciseSheetOpen}
        onOpenChange={setIsAddExerciseSheetOpen}
        onSelectExercise={handleSelectExercise} // Use our local handler
        trainingType={trainingConfig?.trainingType}
      />
      
      {/* Alternative wizard for creating new exercises */}
      <ExerciseWizardSheet
        open={false}  // Use a separate state if you want to show this sheet
        onOpenChange={() => {}}
        onSelectExercise={handleSelectExercise} // Use the same handler here too
        trainingType={trainingConfig?.trainingType}
      />
      
      {/* Sheet for rating set difficulty */}
      <PostSetRatingSheet
        open={isRatingSheetOpen}
        onOpenChange={setIsRatingSheetOpen}
        onSubmitRating={handleSubmitRating}
        exerciseName={exerciseName}
        setDetails={setDetails}
      />
    </>
  );
};
