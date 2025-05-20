
import React from 'react';
import { AddExerciseSheet } from "@/components/training/AddExerciseSheet";
import { PostSetRatingSheet } from '@/components/training/PostSetRatingSheet';
import { ExerciseWizardSheet } from '@/components/exercises/ExerciseWizardSheet';
import { safeRenderableExercise } from '@/utils/exerciseAdapter';
import { ExerciseSet } from '@/store/workout/types';
import { getStore } from '@/store/workout/store';

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
  console.log('TrainingSessionSheets: Component rendering');
  console.log('TrainingSessionSheets: isAddExerciseSheetOpen:', isAddExerciseSheetOpen);
  console.log('TrainingSessionSheets: handleAddExercise is a function:', typeof handleAddExercise === 'function');
  
  // This is the critical handler with enhanced logging
  const handleSelectExercise = (exerciseName: string) => {
    // Debug log to verify this handler is being called
    console.log('TrainingSessionSheets: handleSelectExercise called with', exerciseName);
    console.log('TrainingSessionSheets: Current exercises before adding:', 
      Object.keys(getStore().getState().exercises));
    
    // Call the parent's handleAddExercise function (from useTrainingSession hook)
    handleAddExercise(exerciseName);
    
    // Schedule a check to verify if the exercise was added
    setTimeout(() => {
      console.log('TrainingSessionSheets: Exercises after adding (timeout check):', 
        Object.keys(getStore().getState().exercises));
    }, 500);
    
    // Close the sheet after selecting the exercise
    console.log('TrainingSessionSheets: Closing sheet after selection');
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
        exerciseName={lastCompletedExercise || ''}
        setDetails={lastCompletedSetIndex !== null ? {
          set_number: lastCompletedSetIndex + 1,
          weight: 0,
          reps: 0
        } : undefined}
      />
    </>
  );
};
