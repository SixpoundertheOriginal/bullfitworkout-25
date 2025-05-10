
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ExerciseFormState } from '@/hooks/useExerciseFormState';
import { MultiSelect } from '@/components/MultiSelect';
import { COMMON_MUSCLE_GROUPS, MuscleGroup } from '@/types/exercise';

interface ExerciseDialogBasicProps {
  exercise: ExerciseFormState;
  onChangeName: (name: string) => void;
  onChangeDescription: (description: string) => void;
  onChangePrimaryMuscleGroups?: (groups: string[]) => void;
  formError?: string;
}

export const ExerciseDialogBasic = React.memo(function ExerciseDialogBasic({
  exercise,
  onChangeName,
  onChangeDescription,
  onChangePrimaryMuscleGroups,
  formError
}: ExerciseDialogBasicProps) {
  // Convert muscle groups to options format required by MultiSelect
  const muscleGroupOptions = (COMMON_MUSCLE_GROUPS || []).map(group => ({
    label: group.charAt(0).toUpperCase() + group.slice(1), // Capitalize first letter
    value: group
  }));

  const isPrimaryMuscleGroupsError = !exercise.primary_muscle_groups || 
    (Array.isArray(exercise.primary_muscle_groups) && exercise.primary_muscle_groups.length === 0);

  return (
    <>
      <div>
        <Label htmlFor="name">Exercise Name*</Label>
        <Input
          id="name"
          placeholder="e.g. Bench Press"
          value={exercise.name}
          onChange={(e) => onChangeName(e.target.value)}
        />
        {formError && formError.includes('name') && (
          <p className="mt-1 text-sm text-red-500">{formError}</p>
        )}
      </div>
      
      <div className="mt-4">
        <Label htmlFor="primary-muscle-groups" className="flex">
          Primary Muscle Groups
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <MultiSelect
          options={muscleGroupOptions}
          selected={Array.isArray(exercise.primary_muscle_groups) ? exercise.primary_muscle_groups : []}
          onChange={onChangePrimaryMuscleGroups || (() => {})}
          placeholder="Select primary muscles worked"
          className={`${isPrimaryMuscleGroupsError ? 'border-red-500' : ''}`}
        />
        {isPrimaryMuscleGroupsError && (
          <p className="mt-1 text-sm text-red-500">At least one primary muscle group is required</p>
        )}
      </div>
      
      <div className="mt-4">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Brief description…"
          value={exercise.description}
          onChange={(e) => onChangeDescription(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
    </>
  );
});
