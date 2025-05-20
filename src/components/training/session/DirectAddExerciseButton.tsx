
import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface DirectAddExerciseButtonProps {
  onAddExercise: (exerciseName: string) => void;
}

export const DirectAddExerciseButton: React.FC<DirectAddExerciseButtonProps> = ({
  onAddExercise
}) => {
  const handleClick = () => {
    console.log('DirectAddExerciseButton: Direct test button clicked');
    // Use a hardcoded exercise name for testing
    const testExerciseName = "Bench Press";
    console.log('DirectAddExerciseButton: Attempting to add:', testExerciseName);
    onAddExercise(testExerciseName);
  };

  return (
    <Button 
      onClick={handleClick} 
      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700"
      size="sm"
    >
      <PlusCircle className="mr-1 h-4 w-4" />
      TEST ADD
    </Button>
  );
};
