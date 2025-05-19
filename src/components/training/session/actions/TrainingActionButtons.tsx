
import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

interface TrainingActionButtonsProps {
  onFinishWorkout: () => void;
  isSaving: boolean;
  onOpenAddExercise: () => void;
  hasExercises: boolean;
  className?: string;
}

export const TrainingActionButtons: React.FC<TrainingActionButtonsProps> = ({
  onFinishWorkout,
  isSaving,
  onOpenAddExercise,
  hasExercises,
  className
}) => {
  return (
    <div className={cn("flex justify-between gap-2 mt-4", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={onOpenAddExercise}
        className="flex-1 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
      >
        Add Exercise
      </Button>
      
      {hasExercises && (
        <Button
          variant="default"
          size="sm"
          onClick={onFinishWorkout}
          disabled={isSaving}
          className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white"
        >
          {isSaving ? "Saving..." : "Finish Workout"}
        </Button>
      )}
    </div>
  );
};
