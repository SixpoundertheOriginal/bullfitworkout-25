
import React from 'react';
import { Exercise } from '@/types/exercise';
import { CommonExerciseCard } from '../exercises/CommonExerciseCard';

interface ExerciseCardProps {
  exercise: Exercise | string;
  onAdd?: (exercise: Exercise | string) => void;
  sets?: any[];
  isActive?: boolean;
  onAddSet?: () => void;
  onCompleteSet?: (setIndex: number) => void;
  onDeleteExercise?: () => void;
  onRemoveSet?: (setIndex: number) => void;
  onEditSet?: (setIndex: number) => void;
  onSaveSet?: (setIndex: number) => void;
  onWeightChange?: (setIndex: number, value: string) => void;
  onRepsChange?: (setIndex: number, value: string) => void;
  onRestTimeChange?: (setIndex: number, value: string) => void;
  onWeightIncrement?: (setIndex: number, increment: number) => void;
  onRepsIncrement?: (setIndex: number, increment: number) => void;
  onRestTimeIncrement?: (setIndex: number, increment: number) => void;
  onShowRestTimer?: () => void;
  onResetRestTimer?: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  exercise, 
  onAdd,
  sets,
  isActive,
  onAddSet,
  onCompleteSet,
  onDeleteExercise,
  onRemoveSet,
  onEditSet,
  onSaveSet,
  onWeightChange,
  onRepsChange,
  onRestTimeChange,
  onWeightIncrement,
  onRepsIncrement,
  onRestTimeIncrement,
  onShowRestTimer,
  onResetRestTimer
}) => {
  return (
    <CommonExerciseCard
      exercise={exercise}
      variant={onAdd ? "workout-add" : "workout"}
      onAdd={onAdd ? () => onAdd(exercise) : undefined}
      sets={sets}
      isActive={isActive}
      onAddSet={onAddSet}
      onCompleteSet={onCompleteSet}
      onDeleteExercise={onDeleteExercise}
      onRemoveSet={onRemoveSet}
      onEditSet={onEditSet}
      onSaveSet={onSaveSet}
      onWeightChange={onWeightChange}
      onRepsChange={onRepsChange}
      onRestTimeChange={onRestTimeChange}
      onWeightIncrement={onWeightIncrement}
      onRepsIncrement={onRepsIncrement}
      onRestTimeIncrement={onRestTimeIncrement}
      onShowRestTimer={onShowRestTimer}
      onResetRestTimer={onResetRestTimer}
    />
  );
};

export default ExerciseCard;
