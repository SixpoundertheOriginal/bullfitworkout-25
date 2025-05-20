
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
  
  // Button has been intentionally removed as requested
  // The component still exists to maintain the codebase structure
  // and will be replaced with a new button in a future update
  return (
    <div className="flex justify-center px-4 my-6">
      {/* No button rendered - intentionally removed as requested */}
    </div>
  );
};
