
import React from 'react';
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
    if (!exercise) {
      onOpenChange(false);
      return;
    }
    
    const exerciseName = getExerciseName(exercise);
    console.log('ExerciseWizardSheet: Exercise created with name:', exerciseName);
    onSelectExercise(exerciseName);
  };

  return (
    <EnhancedExerciseCreationSheet
      open={open}
      onOpenChange={onOpenChange}
      onExerciseCreated={handleExerciseCreated}
    />
  );
}
