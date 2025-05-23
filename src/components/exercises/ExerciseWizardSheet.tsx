
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Exercise } from '@/types/exercise';
import { getExerciseName } from '@/utils/exerciseAdapter';
import { EnhancedExerciseCreationSheet } from './enhanced/EnhancedExerciseCreationSheet';

interface ExerciseWizardSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectExercise: (exerciseName: string) => void;
  trainingType?: string;
}

export function ExerciseWizardSheet({
  open,
  onOpenChange,
  onSelectExercise,
  trainingType = ""
}: ExerciseWizardSheetProps) {
  const handleExerciseCreated = (exercise: Exercise) => {
    // Extract the exercise name and pass it back to the parent component
    if (!exercise) {
      onOpenChange(false);
      return;
    }
    
    const exerciseName = getExerciseName(exercise);
    console.log('ExerciseWizardSheet: Exercise created with name:', exerciseName);
    onSelectExercise(exerciseName);
    
    // We don't close the sheet immediately because we want to show the completion screen
    // The wizard's complete step has its own close button
  };

  // Return the EnhancedExerciseCreationSheet component directly
  // This ensures we're passing a single child element to Sheet
  return (
    <EnhancedExerciseCreationSheet
      open={open}
      onOpenChange={onOpenChange}
      onExerciseCreated={handleExerciseCreated}
    />
  );
}
