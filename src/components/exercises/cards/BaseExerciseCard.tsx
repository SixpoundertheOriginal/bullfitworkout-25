
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Exercise } from '@/types/exercise';

export interface BaseExerciseCardProps {
  exercise: Exercise | string;
  className?: string;
  isSelected?: boolean;
  isVariation?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const BaseExerciseCard: React.FC<BaseExerciseCardProps> = ({
  exercise,
  className,
  isSelected = false,
  isVariation = false,
  onClick,
  children
}) => {
  // Handle both string and Exercise object
  const exerciseName = typeof exercise === 'string' ? exercise : exercise.name;
  
  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        onClick ? "cursor-pointer" : "",
        isSelected ? "border-purple-500 ring-1 ring-purple-500/30" : "border-gray-800",
        isVariation ? "bg-gray-900/60" : "bg-gray-900",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        {children || (
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-100">{exerciseName}</h3>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
