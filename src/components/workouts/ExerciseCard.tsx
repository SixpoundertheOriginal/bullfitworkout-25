
import React from 'react';
import { Exercise } from '@/types/exercise';
import { CommonExerciseCard } from '../exercises/CommonExerciseCard';
import { ExerciseThumbnail } from '../exercises/cards/ExerciseThumbnail';
import { cn } from '@/lib/utils';

interface ExerciseCardProps {
  exercise: Exercise;
  onAdd?: (exercise: Exercise) => void;
  className?: string;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onAdd, className }) => {
  return (
    <CommonExerciseCard
      exercise={exercise}
      variant="workout-add"
      onAdd={onAdd ? () => onAdd(exercise) : undefined}
      thumbnail={typeof exercise !== 'string' ? 
        <ExerciseThumbnail 
          exercise={exercise} 
          className="transition-all duration-300 group-hover:scale-105" 
        /> : undefined}
      className={cn(
        "hover:scale-[1.02] active:scale-[0.98] transition-all duration-200",
        "tap-highlight-transparent shadow-md hover:shadow-lg",
        "bg-gradient-to-br from-gray-900/80 to-gray-800/60",
        "border border-white/5",
        className
      )}
    />
  );
};

export default ExerciseCard;
