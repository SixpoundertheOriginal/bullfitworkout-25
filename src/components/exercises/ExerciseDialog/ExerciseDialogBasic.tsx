
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ExerciseFormState } from '@/hooks/useExerciseFormState';

interface ExerciseDialogBasicProps {
  exercise: ExerciseFormState;
  onChangeName: (name: string) => void;
  onChangeDescription: (description: string) => void;
  formError?: string;
}

export const ExerciseDialogBasic = React.memo(function ExerciseDialogBasic({
  exercise,
  onChangeName,
  onChangeDescription,
  formError
}: ExerciseDialogBasicProps) {
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
