
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
          ? "border-purple-500 ring-1 ring-purple-500/30 shadow-md shadow-purple-500/10" 
          : "border-gray-800/80 hover:border-gray-700/80",
        isActive 
          ? "border-purple-500/50 bg-gradient-to-br from-gray-900 to-gray-800/90 shadow-md shadow-purple-500/10" 
          : isVariation 
            ? "bg-gradient-to-br from-gray-900/80 to-gray-800/60" 
            : "bg-gradient-to-br from-gray-900/90 to-gray-800/70",
        "tap-highlight-transparent",
        className
      )}
      onClick={onClick}
    >
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent animate-pulse pointer-events-none" />
      )}
      
      <CardContent className="p-3">
        {children || (
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-100">{exerciseName}</h3>
          </div>
        )}
      </CardContent>
      
      {/* Enhanced highlight effect on hover */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br from-purple-500/0 via-transparent to-purple-500/0",
        "opacity-0 pointer-events-none",
        "transition-opacity duration-300 group-hover:opacity-15"
      )} />
      
      {/* Subtle border glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-[inherit] pointer-events-none",
        "opacity-0 group-hover:opacity-100",
        "transition-opacity duration-300",
        "border border-purple-500/20"
      )} />
    </Card>
  );
};
