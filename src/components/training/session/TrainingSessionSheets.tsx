
import React from 'react';
import { AddExerciseSheet } from '@/components/training/AddExerciseSheet';
import { PostSetRatingSheet } from '@/components/training/PostSetRatingSheet';
import { TrainingConfig } from '@/hooks/useTrainingSetupPersistence';

interface TrainingSessionSheetsProps {
  isAddExerciseSheetOpen: boolean;
  setIsAddExerciseSheetOpen: (open: boolean) => void;
  isRatingSheetOpen: boolean;
  setIsRatingSheetOpen: (open: boolean) => void;
  handleSubmitRating: (rpe: number) => void;
  trainingConfig: TrainingConfig | null;
  lastCompletedExercise: string | null;
  lastCompletedSetIndex: number | null;
  handleAddExercise?: (exerciseName: string) => void;
}

export const TrainingSessionSheets: React.FC<TrainingSessionSheetsProps> = ({
  isAddExerciseSheetOpen,
  setIsAddExerciseSheetOpen,
  isRatingSheetOpen,
  setIsRatingSheetOpen,
  handleSubmitRating,
  trainingConfig,
  lastCompletedExercise,
  lastCompletedSetIndex,
  handleAddExercise
}) => {
  return (
    <>
      {/* Add Exercise Sheet */}
      <AddExerciseSheet
        open={isAddExerciseSheetOpen}
        onOpenChange={setIsAddExerciseSheetOpen}
        onSelectExercise={handleAddExercise}
        trainingType={trainingConfig?.trainingType || ""}
      />
      
      {/* Post-Set Rating Sheet */}
      <PostSetRatingSheet
        open={isRatingSheetOpen}
        onOpenChange={setIsRatingSheetOpen}
        onSubmitRating={handleSubmitRating}
        exerciseName={lastCompletedExercise || ''}
        setNumber={lastCompletedSetIndex !== null ? lastCompletedSetIndex + 1 : 1}
      />
    </>
  );
};
