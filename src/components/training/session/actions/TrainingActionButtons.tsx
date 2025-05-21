
import React from 'react';
import { Button } from "@/components/ui/button";
import { SaveAll } from "lucide-react";

export interface TrainingActionButtonsProps {
  onFinishWorkout: () => void;
  isSubmitting?: boolean;
  exerciseCount: number;
  completedSets: number;
}

export const TrainingActionButtons: React.FC<TrainingActionButtonsProps> = ({
  onFinishWorkout,
  isSubmitting = false,
  exerciseCount,
  completedSets
}) => {
  const disabled = exerciseCount === 0 || completedSets === 0 || isSubmitting;
  
  return (
    <div className="fixed bottom-20 left-0 right-0 flex justify-center px-4 z-50">
      <Button
        onClick={onFinishWorkout}
        disabled={disabled}
        size="lg"
        variant="default"
        className={`
          w-full max-w-md shadow-lg 
          ${isSubmitting ? 'opacity-80' : 'opacity-100'} 
          ${disabled 
            ? 'bg-gray-700 text-gray-300' 
            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
          }
        `}
      >
        <SaveAll className="mr-2 h-5 w-5" />
        {isSubmitting ? "Saving..." : "Finish Workout"}
      </Button>
    </div>
  );
};
