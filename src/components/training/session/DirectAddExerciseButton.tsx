
import React from 'react';
import { AddExerciseButton } from '@/components/training/session/AddExerciseButton';

interface DirectAddExerciseButtonProps {
  onAddExercise: (exerciseName: string) => void;
}

export const DirectAddExerciseButton: React.FC<DirectAddExerciseButtonProps> = ({ 
  onAddExercise 
}) => {
  const handleOpenExerciseSheet = () => {
    console.log('DirectAddExerciseButton: Opening exercise sheet');
    // Pass empty string to signal we want to open the exercise selection sheet
    onAddExercise('');
  };
  
  return (
    <div className="flex justify-center px-4 my-6">
      <AddExerciseButton
        onClick={handleOpenExerciseSheet}
        className="w-full max-w-md"
        label="Add Exercise"
      />
    </div>
  );
};
