
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Exercise } from '@/types/exercise';
import { cn } from '@/lib/utils';
import { isExerciseObject, safeRenderableExercise } from '@/utils/exerciseAdapter';

interface ExerciseCardContentProps {
  exerciseName: string;
  exerciseData?: Exercise;
  variationBadge?: React.ReactNode;
  thumbnail?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
}

export const ExerciseCardContent: React.FC<ExerciseCardContentProps> = ({
  exerciseName,
  exerciseData,
  variationBadge,
  thumbnail,
  rightContent,
  className
}) => {
  // Safety check: ensure we always render a string
  const safeExerciseName = safeRenderableExercise(exerciseName);
  
  // Get the exercise properties only if exerciseData is provided
  const primaryMuscleGroups = exerciseData ? exerciseData.primary_muscle_groups : [];
  const equipmentType = exerciseData ? exerciseData.equipment_type : [];

  return (
    <div className={cn(
      "flex items-center justify-between w-full",
      className
    )}>
      <div className="flex flex-grow mr-2">
        {thumbnail && (
          <div className="mr-3 flex-shrink-0">
            {thumbnail}
          </div>
        )}
        <div className="flex flex-col flex-grow">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-gray-100 line-clamp-1">{safeExerciseName}</h3>
            
            {/* Display variation badge if provided */}
            {variationBadge && (
              <div className="ml-2">{variationBadge}</div>
            )}
          </div>
          
          {exerciseData && (
            <div className="flex flex-wrap gap-1 mt-1">
              {/* Primary muscle groups */}
              {Array.isArray(primaryMuscleGroups) && primaryMuscleGroups.length > 0 && (
                <Badge variant="outline" className="bg-purple-900/20 border-purple-700/30 text-purple-300 text-xs">
                  {primaryMuscleGroups[0]}
                </Badge>
              )}
              
              {/* Equipment type */}
              {Array.isArray(equipmentType) && equipmentType.length > 0 && (
                <Badge variant="outline" className="bg-blue-900/20 border-blue-700/30 text-blue-300 text-xs">
                  {equipmentType[0]}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Right side content */}
      {rightContent && (
        <div className="flex-shrink-0">
          {rightContent}
        </div>
      )}
    </div>
  );
};
