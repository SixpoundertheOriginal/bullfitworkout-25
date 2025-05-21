import React, { useEffect } from 'react';
import { AddExerciseSheet } from "@/components/training/AddExerciseSheet";
import { PostSetRatingSheet } from '@/components/training/PostSetRatingSheet';
import { ExerciseWizardSheet } from '@/components/exercises/ExerciseWizardSheet';
import { safeRenderableExercise } from '@/utils/exerciseAdapter';
import { ExerciseSet } from '@/store/workout/types';
import { getStore } from '@/store/workout/store';

interface TrainingSessionSheetsProps {
  isAddExerciseSheetOpen: boolean;
  isRatingSheetOpen: boolean;
  setIsAddExerciseSheetOpen: (open: boolean) => void;
  setIsRatingSheetOpen: (open: boolean) => void;
  handleAddExercise: (exerciseName: string) => void;
  handleSubmitRating: (rpe: number) => void;
  trainingConfig: any;
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
  console.log('TrainingSessionSheets: Component rendering with props:', { 
    isAddExerciseSheetOpen, 
    isRatingSheetOpen 
  });

  useEffect(() => {
    console.log("🟡 Sheets re-rendered with open =", isAddExerciseSheetOpen);
  }, [isAddExerciseSheetOpen]);

  const handleSelectExercise = (exerciseName: string) => {
    if (!exerciseName || typeof exerciseName !== 'string') {
      console.warn("⚠️ Skipping invalid exerciseName:", exerciseName);
      return;
    }

    console.log('TrainingSessionSheets: handleSelectExercise called with', exerciseName);
    console.log('TrainingSessionSheets: Current exercises before adding:', 
      Object.keys(getStore().getState().exercises));

    handleAddExercise(exerciseName);

    setTimeout(() => {
      console.log('TrainingSessionSheets: Exercises after adding (timeout check):', 
        Object.keys(getStore().getState().exercises));
    }, 500);

    console.log('🟢 Scheduling sheet close after short delay');
    setTimeout(() => {
      console.log('✅ Closing sheet after delay');
      setIsAddExerciseSheetOpen(false);
    }, 300);
  };

  return (
    <>
      <AddExerciseSheet
        open={isAddExerciseSheetOpen}
        onOpenChange={(isOpen) => {
          console.log('TrainingSessionSheets: AddExerciseSheet onOpenChange called with:', isOpen);
          setIsAddExerciseSheetOpen(isOpen);
        }}
        onSelectExercise={handleSelectExercise}
        trainingType={trainingConfig?.trainingType}
      />

      <ExerciseWizardSheet
        open={false}
        onOpenChange={() => {}}
        onSelectExercise={handleSelectExercise}
        trainingType={trainingConfig?.trainingType}
      />

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
