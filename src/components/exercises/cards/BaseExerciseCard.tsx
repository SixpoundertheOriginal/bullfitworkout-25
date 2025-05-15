
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Exercise } from '@/types/exercise';

export interface BaseExerciseCardProps {
  exercise: Exercise | string;
  className?: string;
  isSelected?: boolean;
  isVariation?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const BaseExerciseCard: React.FC<BaseExerciseCardProps> = ({
  exercise,
  className,
  isSelected = false,
  isVariation = false,
  isActive = false,
  onClick,
  children
}) => {
  // Handle both string and Exercise object
  const exerciseName = typeof exercise === 'string' ? exercise : exercise.name;
  
  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-200 group",
        onClick ? "cursor-pointer active:scale-[0.98]" : "",
        isSelected 
          ? "border-purple-500 ring-1 ring-purple-500/30 shadow-sm shadow-purple-500/10" 
          : "border-gray-800 hover:border-gray-700/80",
        isActive 
          ? "border-purple-500/50 bg-gray-900/90 shadow-md shadow-purple-500/10" 
          : isVariation 
            ? "bg-gray-900/60" 
            : "bg-gray-900",
        "tap-highlight-transparent",
        className
      )}
      onClick={onClick}
    >
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none" />
      )}
      
      <CardContent className="p-3">
        {children || (
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-100">{exerciseName}</h3>
          </div>
        )}
      </CardContent>
      
      {/* Subtle highlight effect on hover */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/0 opacity-0 pointer-events-none",
        "transition-opacity duration-300 group-hover:opacity-10"
      )} />
    </Card>
  );
};
