
import React from 'react';
import { useTrainingSession } from "@/hooks/training-session";
import { AddExerciseSheet } from "@/components/training/AddExerciseSheet";
import { PostSetRatingSheet } from '@/components/training/PostSetRatingSheet';
import { ExerciseWizardSheet } from '@/components/exercises/ExerciseWizardSheet';
import { safeRenderableExercise } from '@/utils/exerciseAdapter';

export const TrainingSessionSheets: React.FC = () => {
  const {
    isAddExerciseSheetOpen,
    setIsAddExerciseSheetOpen,
    handleAddExercise,
    isRatingSheetOpen,
    setIsRatingSheetOpen,
    handleSubmitRating,
    trainingConfig
  } = useTrainingSession();

  return (
    <>
      {/* Sheet for adding new exercises */}
      <AddExerciseSheet
        open={isAddExerciseSheetOpen}
        onOpenChange={setIsAddExerciseSheetOpen}
        onSelectExercise={(exerciseName) => {
          handleAddExercise(exerciseName);
          setIsAddExerciseSheetOpen(false);
        }}
        trainingType={trainingConfig?.trainingType}
      />
      
      {/* Alternative wizard for creating new exercises */}
      <ExerciseWizardSheet
        open={false}  // Use a separate state if you want to show this sheet
        onOpenChange={() => {}}
        onSelectExercise={(exerciseName) => {
          handleAddExercise(exerciseName);
        }}
        trainingType={trainingConfig?.trainingType}
      />
      
      {/* Sheet for rating set difficulty */}
      <PostSetRatingSheet
        open={isRatingSheetOpen}
        onOpenChange={setIsRatingSheetOpen}
        onSubmit={handleSubmitRating}
      />
    </>
  );
};
