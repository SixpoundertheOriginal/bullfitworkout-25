
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExerciseCard } from "@/components/exercises/ExerciseCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Exercise } from "@/types/exercise";

export interface ExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (exercise: Exercise) => void;
  onSubmit?: (exercise: any) => void | Promise<void>;
  initialExercise?: Exercise | null;
  baseExercise?: Exercise | null;
  loading?: boolean;
  mode?: "add" | "edit";
}

// Simplified exercise placeholder for the dialog
interface PlaceholderExercise {
  id: string;
  name: string;
  muscles: string;
}

const PLACEHOLDER_EXERCISES: PlaceholderExercise[] = [
  { id: 'bench-press', name: 'Bench Press', muscles: 'Chest, Triceps' },
  { id: 'squat', name: 'Squat', muscles: 'Quads, Hamstrings, Glutes' },
  { id: 'deadlift', name: 'Deadlift', muscles: 'Lower Back, Hamstrings, Glutes' },
  { id: 'pull-up', name: 'Pull-Up', muscles: 'Back, Biceps' },
  { id: 'push-up', name: 'Push-Up', muscles: 'Chest, Shoulders, Triceps' },
  { id: 'shoulder-press', name: 'Shoulder Press', muscles: 'Shoulders, Triceps' },
  { id: 'bent-over-row', name: 'Bent Over Row', muscles: 'Back, Biceps' },
  { id: 'dip', name: 'Dip', muscles: 'Chest, Triceps' },
  { id: 'leg-press', name: 'Leg Press', muscles: 'Quads, Hamstrings' },
  { id: 'lateral-raise', name: 'Lateral Raise', muscles: 'Shoulders' },
];

export const ExerciseDialog: React.FC<ExerciseDialogProps> = ({
  open,
  onOpenChange,
  onSelect,
  onSubmit,
  mode = "select",
  initialExercise,
  baseExercise,
  loading
}) => {
  // Convert placeholder exercises to Exercise type with minimal required properties
  const convertToExercise = (placeholder: PlaceholderExercise): Exercise => {
    return {
      id: placeholder.id,
      name: placeholder.name,
      description: '',
      primary_muscle_groups: [],
      secondary_muscle_groups: [],
      equipment_type: [],
      movement_pattern: 'push', // Default value
      difficulty: 'intermediate', // Default value
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Exercise</DialogTitle>
          <DialogDescription>
            Choose an exercise to add to your workout.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow pr-4 mt-4">
          <div className="space-y-4">
            {PLACEHOLDER_EXERCISES.map((placeholderExercise) => {
              // Create a simplified exercise object that meets the required type
              const exercise = convertToExercise(placeholderExercise);
              
              return (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onClick={() => {
                    if (onSelect) {
                      onSelect(exercise);
                      onOpenChange(false);
                    } else if (onSubmit) {
                      onSubmit(exercise);
                      onOpenChange(false);
                    }
                  }}
                  className="cursor-pointer hover:bg-gray-800 transition-colors"
                />
              );
            })}
          </div>
        </ScrollArea>

        <div className="mt-6 flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseDialog;
