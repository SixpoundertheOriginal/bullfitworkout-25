
import React from 'react';
import { Exercise } from '@/types/exercise';
import { CommonExerciseCard } from '../exercises/CommonExerciseCard';
import { ExerciseThumbnail } from '../exercises/cards/ExerciseThumbnail';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { getExerciseName } from '@/utils/exerciseAdapter';

interface ExerciseCardProps {
  exercise: Exercise | string;
  onAdd?: (exerciseName: string) => void;
  className?: string;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onAdd, className }) => {
  const handleAdd = () => {
    if (onAdd) {
      // Always pass the exercise name to avoid React errors with object children
      const exerciseName = getExerciseName(exercise);
      onAdd(exerciseName);
    }
  };

  // Get exercise name for display
  const exerciseName = getExerciseName(exercise);
  
  // Only try to render thumbnail if we have the full exercise object
  const thumbnail = typeof exercise !== 'string' ? 
    <ExerciseThumbnail 
      exercise={exercise} 
      className="transition-all duration-300 group-hover:scale-105" 
    /> : undefined;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <CommonExerciseCard
        exercise={exerciseName}
        variant="workout-add"
        onAdd={onAdd ? handleAdd : undefined}
        thumbnail={thumbnail}
        className={cn(
          "hover:scale-[1.02] active:scale-[0.98] transition-all duration-200",
          "tap-highlight-transparent shadow-md hover:shadow-lg",
          "bg-gradient-to-br from-gray-900/80 to-gray-800/60",
          "border border-white/5",
          className
        )}
      />
    </motion.div>
  );
};

export default ExerciseCard;
