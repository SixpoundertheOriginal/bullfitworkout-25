
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ExerciseFormState } from '@/hooks/useExerciseFormState';

interface ExerciseDialogBasicProps {
  exercise: ExerciseFormState;
  onChangeName: (name: string) => void;
  onChangeDescription: (description: string) => void;
}

export const ExerciseDialogBasic = React.memo(function ExerciseDialogBasic({
  exercise,
  onChangeName,
  onChangeDescription
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
      </div>
      <div>
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
