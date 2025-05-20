
import React from 'react';
import { DirectAddExerciseButton } from './DirectAddExerciseButton';
import { PlusSquare } from 'lucide-react';

interface EmptyWorkoutStateProps {
  onAddExercise: (exerciseName: string) => void;
}

export const EmptyWorkoutState: React.FC<EmptyWorkoutStateProps> = ({ onAddExercise }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 mt-8">
      <div className="bg-gray-800/50 rounded-full p-5 mb-6">
        <PlusSquare size={40} className="text-purple-400" />
      </div>
      
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Add Your First Exercise</h2>
        <p className="text-gray-400 max-w-md">
          Start by selecting an existing exercise or create a custom one for your workout session.
        </p>
      </div>
      
      <DirectAddExerciseButton onAddExercise={onAddExercise} />
    </div>
  );
};
