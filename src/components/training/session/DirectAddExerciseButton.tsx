
import React from 'react';

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
      {/* Button has been removed, we'll add a replacement in the next step */}
      <div className="py-4">
        {/* Placeholder div to maintain spacing */}
      </div>
    </div>
  );
};
