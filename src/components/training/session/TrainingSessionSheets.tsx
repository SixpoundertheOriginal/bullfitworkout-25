
import React from 'react';
import { useTrainingSession } from "@/hooks/training-session";
import { AddExerciseSheet } from "@/components/training/AddExerciseSheet";
import { PostSetRatingSheet } from "@/components/training/PostSetRatingSheet";
import { safeRenderableExercise } from "@/utils/exerciseAdapter";

export const TrainingSessionSheets: React.FC = () => {
  const {
    isAddExerciseSheetOpen,
    setIsAddExerciseSheetOpen,
    isRatingSheetOpen,
    setIsRatingSheetOpen,
    handleAddExercise,
    handleSubmitRating,
    trainingConfig,
    lastCompletedExercise,
    lastCompletedSetIndex,
    exercises,
    setPostSetFlow,
  } = useTrainingSession();

  return (
    <>
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
    </>
  );
};
