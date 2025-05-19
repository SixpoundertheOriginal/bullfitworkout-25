
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Exercise } from '@/types/exercise';
import { cn } from '@/lib/utils';
import { safeRenderableExercise } from '@/utils/exerciseAdapter';

interface BaseExerciseCardProps {
  exerciseName: string;
  exerciseData?: Exercise;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
  isSelected?: boolean;
}

export const BaseExerciseCard: React.FC<BaseExerciseCardProps> = ({
  exerciseName,
  exerciseData,
  children,
  className,
  onClick,
  isActive,
  isSelected
}) => {
  // Safety check: ensure we always have a valid string for data attributes
  const safeExerciseName = safeRenderableExercise(exerciseName);
  
  return (
    <Card
      data-exercise-name={safeExerciseName}
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
