
import React, { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExerciseFormState } from '@/hooks/useExerciseFormState';
import { 
  MovementPattern, 
  Difficulty,
  MOVEMENT_PATTERNS, 
  DIFFICULTY_LEVELS 
} from '@/types/exercise';

interface ExerciseDialogAdvancedProps {
  exercise: ExerciseFormState;
  onChangeDifficulty: (difficulty: Difficulty) => void;
  onChangeMovement: (movement: MovementPattern) => void;
  onToggleCompound: (isCompound: boolean) => void;
}

export const ExerciseDialogAdvanced = React.memo(function ExerciseDialogAdvanced({
  exercise,
  onChangeDifficulty,
  onChangeMovement,
  onToggleCompound
}: ExerciseDialogAdvancedProps) {
  // Memoize movement patterns and difficulty levels
  const movements = useMemo(() => MOVEMENT_PATTERNS, []);
  const difficulties = useMemo(() => DIFFICULTY_LEVELS, []);
  
  return (
    <>
      <div>
        <Label htmlFor="difficulty">Difficulty</Label>
        <Select
          value={exercise.difficulty}
          onValueChange={(v) => onChangeDifficulty(v as Difficulty)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            {difficulties.map((lvl) => (
              <SelectItem key={lvl} value={lvl}>
                {lvl}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="movement">Movement Pattern</Label>
        <Select
          value={exercise.movement_pattern}
          onValueChange={(v) => onChangeMovement(v as MovementPattern)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select movement" />
          </SelectTrigger>
          <SelectContent>
            {movements.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_compound"
          checked={exercise.is_compound}
          onCheckedChange={(c) => onToggleCompound(c as boolean)}
        />
        <Label htmlFor="is_compound">Compound exercise</Label>
      </div>
    </>
  );
});
