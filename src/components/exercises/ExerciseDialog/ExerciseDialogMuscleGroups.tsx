
import React from 'react';
import { Label } from '@/components/ui/label';
import { ExerciseFormState } from '@/hooks/useExerciseFormState';
import { MuscleGroup, COMMON_MUSCLE_GROUPS } from '@/types/exercise';
import { MultiSelect } from '@/components/MultiSelect';

interface ExerciseDialogMuscleGroupsProps {
  exercise: ExerciseFormState;
  onChangePrimaryMuscles: (muscles: MuscleGroup[]) => void;
  onChangeSecondaryMuscles: (muscles: MuscleGroup[]) => void;
}

export const ExerciseDialogMuscleGroups = React.memo(function ExerciseDialogMuscleGroups({
  exercise,
  onChangePrimaryMuscles,
  onChangeSecondaryMuscles
}: ExerciseDialogMuscleGroupsProps) {
  // Add extra safeguards against undefined
  if (!exercise) {
    console.error("Exercise is undefined in ExerciseDialogMuscleGroups");
    return null;
  }
  
  // Ensure the muscle groups are arrays with defensive programming
  const primaryMuscles = Array.isArray(exercise.primary_muscle_groups) 
    ? exercise.primary_muscle_groups 
    : [];
    
  const secondaryMuscles = Array.isArray(exercise.secondary_muscle_groups) 
    ? exercise.secondary_muscle_groups 
    : [];
  
  // Create options array for the MultiSelect component
  const muscleOptions = COMMON_MUSCLE_GROUPS.map(muscle => ({
    label: muscle.charAt(0).toUpperCase() + muscle.slice(1),
    value: muscle
  }));
  
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="primary-muscles" className="mb-2 block">Primary Muscle Groups</Label>
        <MultiSelect
          options={muscleOptions}
          selected={primaryMuscles}
          onChange={(values) => onChangePrimaryMuscles(values as MuscleGroup[])}
          placeholder="Select primary muscles"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Main muscles targeted by this exercise
        </p>
      </div>
      
      <div>
        <Label htmlFor="secondary-muscles" className="mb-2 block">Secondary Muscle Groups</Label>
        <MultiSelect
          options={muscleOptions}
          selected={secondaryMuscles}
          onChange={(values) => onChangeSecondaryMuscles(values as MuscleGroup[])}
          placeholder="Select secondary muscles"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Additional muscles engaged during this exercise
        </p>
      </div>
    </div>
  );
});
