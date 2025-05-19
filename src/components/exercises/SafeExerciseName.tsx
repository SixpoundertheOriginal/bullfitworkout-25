
import React from 'react';
import { safeRenderableExercise } from '@/utils/exerciseAdapter';
import { cn } from '@/lib/utils';

interface SafeExerciseNameProps {
  exercise: any; // Accept any type which will be safely rendered
  className?: string;
  maxLength?: number;
  fallback?: string;
}

/**
 * A utility component that safely renders an exercise name
 * preventing React error #31 (rendering objects in JSX)
 */
export const SafeExerciseName: React.FC<SafeExerciseNameProps> = ({
  exercise,
  className,
  maxLength,
  fallback = 'Unknown Exercise'
}) => {
  const exerciseName = safeRenderableExercise(exercise) || fallback;
  
  // Handle truncation if maxLength is provided
  const displayName = maxLength && exerciseName.length > maxLength
    ? `${exerciseName.substring(0, maxLength)}...`
    : exerciseName;
    
  return (
    <span className={cn("exercise-name", className)}>
      {displayName}
    </span>
  );
};

export default SafeExerciseName;
