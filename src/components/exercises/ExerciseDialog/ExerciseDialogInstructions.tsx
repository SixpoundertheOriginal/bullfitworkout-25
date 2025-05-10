
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ExerciseFormState } from '@/hooks/useExerciseFormState';

interface ExerciseDialogInstructionsProps {
  exercise: ExerciseFormState;
  onChangeSteps: (steps: string) => void;
  onChangeForm: (form: string) => void;
}

export const ExerciseDialogInstructions = React.memo(function ExerciseDialogInstructions({
  exercise,
  onChangeSteps,
  onChangeForm
}: ExerciseDialogInstructionsProps) {
  return (
    <>
      <div>
        <Label>Exercise Instructions</Label>
        <Textarea
          placeholder="Step-by-step instructions…"
          value={exercise.instructions.steps}
          onChange={(e) => onChangeSteps(e.target.value)}
          className="min-h-[200px]"
        />
      </div>
      <div>
        <Label>Form Cues</Label>
        <Textarea
          placeholder="Form cues…"
          value={exercise.instructions.form}
          onChange={(e) => onChangeForm(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
    </>
  );
});
