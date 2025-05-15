
import React from 'react';
import { Exercise } from '@/types/exercise';
import { CommonExerciseCard } from '../exercises/CommonExerciseCard';
import { ExerciseThumbnail } from '../exercises/cards/ExerciseThumbnail';

interface ExerciseCardProps {
  exercise: Exercise;
  onAdd?: (exercise: Exercise) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onAdd }) => {
  return (
    <CommonExerciseCard
      exercise={exercise}
      variant="workout-add"
      onAdd={onAdd ? () => onAdd(exercise) : undefined}
      thumbnail={typeof exercise !== 'string' ? <ExerciseThumbnail exercise={exercise} /> : undefined}
    />
  );
};

export default ExerciseCard;
