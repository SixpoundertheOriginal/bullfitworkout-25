
import React from 'react';
import { AddExerciseButton } from './AddExerciseButton';

interface DirectAddExerciseButtonProps {
  onAddExercise: (exerciseName: string) => void;
}

export const DirectAddExerciseButton: React.FC<DirectAddExerciseButtonProps> = ({ 
  onAddExercise 
}) => {
  const handleOpenExerciseSheet = () => {
    console.log('DirectAddExerciseButton: Opening exercise sheet');
    // This would normally add a directly selected exercise, but we'll use it to open the sheet
    // We'll pass an empty string to signal we want to open the exercise selection UI
    onAddExercise('');
  };
  
  return (
    <div className="flex justify-center px-4 my-6">
      <AddExerciseButton
        onClick={handleOpenExerciseSheet}
        label="Add Your First Exercise"
        className="max-w-md"
      />
    </div>
  );
};
