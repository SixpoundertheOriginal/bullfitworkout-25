
import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { PlusCircle, CheckCircle } from 'lucide-react';

interface TrainingActionButtonsProps {
  onFinishWorkout: () => void;
  isSaving: boolean;
  onOpenAddExercise: () => void;
  hasExercises: boolean;
  className?: string;
  showOnMobile?: boolean;
}

export const TrainingActionButtons: React.FC<TrainingActionButtonsProps> = ({
  onFinishWorkout,
  isSaving,
  onOpenAddExercise,
  hasExercises,
  className,
  showOnMobile = false
}) => {
  // If not showing on mobile and we're on a mobile device, hide
  if (!showOnMobile) {
    return null;
  }
  
  return (
    <div className={cn("flex justify-between gap-3 mt-6", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={onOpenAddExercise}
        className="flex-1 bg-gray-800/90 border-gray-700 text-white hover:bg-gray-700/90 transition-all duration-300"
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Exercise
      </Button>
      
      {hasExercises && (
        <Button
          variant="default"
          size="sm"
          onClick={onFinishWorkout}
          disabled={isSaving}
          className={cn(
            "flex-1 transition-all duration-300",
            "bg-gradient-to-r from-green-600 to-green-500",
            "hover:from-green-700 hover:to-green-400", 
            "text-white shadow-md",
            "border border-green-500/20"
          )}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Finish Workout"}
        </Button>
      )}
    </div>
  );
};
