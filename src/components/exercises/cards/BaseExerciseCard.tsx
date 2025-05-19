
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Exercise } from '@/types/exercise';
import { cn } from '@/lib/utils';
import { safeRenderableExercise } from '@/utils/exerciseAdapter';

interface BaseExerciseCardProps {
  exercise: Exercise | string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
  isSelected?: boolean;
}

export const BaseExerciseCard: React.FC<BaseExerciseCardProps> = ({
  exercise,
  children,
  className,
  onClick,
  isActive,
  isSelected
}) => {
  // Use the safe function to handle any type of exercise input
  const exerciseName = safeRenderableExercise(exercise);
  
  return (
    <Card
      data-exercise-name={exerciseName}
      className={cn(
        "overflow-hidden transition-all duration-200 border-gray-800",
        isActive && "border-purple-500/30 shadow-lg shadow-purple-500/10",
        isSelected && "border-green-500/30 shadow-md shadow-green-500/10",
        onClick && "cursor-pointer hover:bg-gray-800/40",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
};
