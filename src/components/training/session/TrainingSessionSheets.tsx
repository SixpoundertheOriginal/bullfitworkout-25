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
  console.log('🚀 TrainingSessionSheets: Component rendering with props:', { 
    isAddExerciseSheetOpen, 
    isRatingSheetOpen 
  });

  useEffect(() => {
    console.log("🟡 TrainingSessionSheets: Sheet open state changed:", isAddExerciseSheetOpen);
  }, [isAddExerciseSheetOpen]);

  const handleSelectExercise = (exerciseName: string) => {
    if (!exerciseName || typeof exerciseName !== 'string') {
      console.warn("⚠️ Skipping invalid exerciseName:", exerciseName);
      return;
    }

    console.log('🔵 TrainingSessionSheets: handleSelectExercise called with:', exerciseName);
    
    // First, check current exercise state
    console.log('🔄 TrainingSessionSheets: Current exercises before adding:', 
      Object.keys(getStore().getState().exercises));

    // Call the parent's handler to add the exercise
    handleAddExercise(exerciseName);

    // We'll delay closing the sheet to ensure the exercise is fully added first
    console.log('⏳ TrainingSessionSheets: Delaying sheet close to ensure exercise is added');
    
    // Schedule a verification check before closing
    const checkAddedAndClose = () => {
      const storeExercises = getStore().getState().exercises;
      console.log('✅ TrainingSessionSheets: Verification before close - exercises in store:', 
        Object.keys(storeExercises));
      
      const exerciseAdded = !!storeExercises[exerciseName];
      console.log('✅ TrainingSessionSheets: Exercise added successfully?', exerciseAdded);
      
      // Only close if the exercise was successfully added
      if (exerciseAdded) {
        console.log('🔒 TrainingSessionSheets: Exercise added, now closing sheet');
        setIsAddExerciseSheetOpen(false);
      } else {
        console.warn('🚫 TrainingSessionSheets: Exercise not added! Keeping sheet open');
        // Keep sheet open if exercise wasn't added
      }
    };
    
    // Delay closure to ensure the exercise is added first
    setTimeout(checkAddedAndClose, 300);
  };

  return (
    <>
      <AddExerciseSheet
        open={isAddExerciseSheetOpen}
        onOpenChange={(isOpen) => {
          console.log('🔄 TrainingSessionSheets: AddExerciseSheet onOpenChange called with:', isOpen);
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
