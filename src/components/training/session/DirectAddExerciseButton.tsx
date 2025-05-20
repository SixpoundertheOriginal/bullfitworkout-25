
import React from 'react';
import { AddExerciseButton } from '@/components/training/session/AddExerciseButton';
import { ExerciseWizardSheet } from '@/components/exercises/ExerciseWizardSheet';
import { useState } from 'react';

interface DirectAddExerciseButtonProps {
  onAddExercise: (exerciseName: string) => void;
}

export const DirectAddExerciseButton: React.FC<DirectAddExerciseButtonProps> = ({ 
  onAddExercise 
}) => {
  const [showExerciseWizard, setShowExerciseWizard] = useState(false);
  
  const handleOpenExerciseSheet = () => {
    console.log('DirectAddExerciseButton: Opening exercise sheet');
    // Pass empty string to signal we want to open the exercise selection sheet
    onAddExercise('');
  };
  
  const handleOpenExerciseWizard = () => {
    console.log('DirectAddExerciseButton: Opening exercise creation wizard');
    setShowExerciseWizard(true);
  };

  const handleExerciseCreated = (exerciseName: string) => {
    console.log('DirectAddExerciseButton: New exercise created:', exerciseName);
    setShowExerciseWizard(false);
    if (exerciseName) {
      onAddExercise(exerciseName);
    }
  };
  
  return (
    <>
      <div className="flex flex-col gap-4 justify-center px-4 my-6">
        <AddExerciseButton
          onClick={handleOpenExerciseSheet}
          className="w-full max-w-md"
          label="Select Exercise"
        />
        
        <AddExerciseButton
          onClick={handleOpenExerciseWizard}
          className="w-full max-w-md bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600"
          label="Create New Exercise"
        />
      </div>
      
      <ExerciseWizardSheet
        open={showExerciseWizard}
        onOpenChange={setShowExerciseWizard}
        onSelectExercise={handleExerciseCreated}
      />
    </>
  );
};
