
import React from 'react';
import { Exercise } from '@/types/exercise';
import { CommonExerciseCard } from '../exercises/CommonExerciseCard';
import { ExerciseThumbnail } from '../exercises/cards/ExerciseThumbnail';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { isExerciseObject, safeRenderableExercise } from '@/utils/exerciseAdapter';

interface ExerciseCardProps {
  exerciseName: string;
  exerciseData?: Exercise;
  onAdd?: (exerciseName: string) => void;
  className?: string;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  exerciseName, 
  exerciseData, 
  onAdd, 
  className 
}) => {
  const handleAdd = () => {
    if (onAdd) {
      // Pass the exercise name to avoid React errors with object children
      onAdd(exerciseName);
    }
  };
  
  // Only try to render thumbnail if we have the full exercise object
  const thumbnail = exerciseData ? 
    <ExerciseThumbnail 
      exercise={exerciseData} 
      className="transition-all duration-300 group-hover:scale-105" 
    /> : undefined;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <CommonExerciseCard
        exercise={exerciseName} // This is now always a string
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
