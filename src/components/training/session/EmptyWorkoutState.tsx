
import React from 'react';
import { DirectAddExerciseButton } from './DirectAddExerciseButton';

interface EmptyWorkoutStateProps {
  onAddExercise: (exerciseName: string) => void;
}

export const EmptyWorkoutState: React.FC<EmptyWorkoutStateProps> = ({ onAddExercise }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 mt-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Add Your First Exercise</h2>
        <p className="text-gray-400 max-w-md">
          Start by adding an exercise to your workout session.
        </p>
      </div>
      
      <DirectAddExerciseButton onAddExercise={onAddExercise} />
    </div>
  );
};
