
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
            <h3 className="font-medium text-gray-100 line-clamp-1">{exerciseName}</h3>
            
            {/* Display variation badge if provided */}
            {variationBadge && (
              <div className="ml-2">{variationBadge}</div>
            )}
          </div>
          
          {exerciseData && (
            <div className="flex flex-wrap gap-1 mt-1">
              {primaryMuscleGroups.slice(0, 3).map((muscle, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  className={cn(
                    "text-xs bg-gray-800/60 border-gray-700/50 text-gray-300",
                    "transition-all duration-200 hover:bg-gray-800 hover:border-gray-600/70"
                  )}
                >
                  {muscle}
                </Badge>
              ))}
              
              {equipmentType.slice(0, 1).map((equipment, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  className={cn(
                    "text-xs bg-gray-800/80 border-gray-700/50 text-gray-400",
                    "transition-all duration-200 hover:bg-gray-800 hover:border-gray-600/70"
                  )}
                >
                  {equipment}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {rightContent && <div>{rightContent}</div>}
    </div>
  );
};
