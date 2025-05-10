
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ExerciseFormState } from '@/hooks/useExerciseFormState';

interface ExerciseDialogMetricsProps {
  exercise: ExerciseFormState;
  onToggleBodyweight: (isBodyweight: boolean) => void;
  onChangeLoadPercent: (percent: number) => void;
}

export const ExerciseDialogMetrics = React.memo(function ExerciseDialogMetrics({
  exercise,
  onToggleBodyweight,
  onChangeLoadPercent
}: ExerciseDialogMetricsProps) {
  return (
    <>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_bodyweight"
          checked={exercise.is_bodyweight}
          onCheckedChange={(c) => onToggleBodyweight(c as boolean)}
        />
        <Label htmlFor="is_bodyweight">Bodyweight exercise</Label>
      </div>
      
      {exercise.is_bodyweight && (
        <div>
          <Label htmlFor="estimated_load_percent">
            Estimated Body Load (%)
          </Label>
          <div className="flex items-center space-x-4">
            <Slider
              defaultValue={[exercise.estimated_load_percent ?? 65]}
              min={10}
              max={100}
              step={5}
              onValueChange={(v) => onChangeLoadPercent(v[0])}
              className="flex-1"
            />
            <span className="w-16 text-center">
              {exercise.estimated_load_percent ?? 65}%
            </span>
          </div>
        </div>
      )}
    </>
  );
});
