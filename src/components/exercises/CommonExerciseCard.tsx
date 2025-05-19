import React from 'react';
import { BaseExerciseCard } from './cards/BaseExerciseCard';
import { Button } from "@/components/ui/button";
import { Exercise } from '@/types/exercise';
import { Plus, Trash2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { safeRenderableExercise } from '@/utils/exerciseAdapter';

interface CommonExerciseCardProps {
  exercise: Exercise | string;
  variant?: 'default' | 'workout' | 'workout-add' | 'selection' | 'compact' | 'list';
  className?: string;
  onAdd?: () => void;
  onSelect?: () => void;
  onDeleteExercise?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  sets?: any[];
  isActive?: boolean;
  isSelected?: boolean;
  isVariation?: boolean;
  onAddSet?: () => void;
  onCompleteSet?: (setIndex: number) => void;
  thumbnail?: React.ReactNode;
  customContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  variationBadge?: React.ReactNode;
}

export const CommonExerciseCard: React.FC<CommonExerciseCardProps> = ({
  exercise,
  variant = 'default',
  className,
  onAdd,
  onSelect,
  onEdit,
  onDelete,
  onDeleteExercise,
  sets,
  isActive,
  isSelected,
  isVariation,
  onAddSet,
  onCompleteSet,
  thumbnail,
  customContent,
  rightContent,
  variationBadge
}) => {
  // Handle both string and Exercise object for the name - using safeRenderableExercise
  // to ensure we always have a string, even if exercise is undefined
  const exerciseName = safeRenderableExercise(exercise);
  
  // For list variant (used in ExerciseVariationGroup)
  if (variant === 'list') {
    return (
      <BaseExerciseCard
        exercise={exercise}
        onClick={onSelect}
        className={className}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            {thumbnail && <div>{thumbnail}</div>}
            <div className="flex flex-col">
              <h3 className="font-medium text-gray-100">{exerciseName}</h3>
              {isVariation && variationBadge && (
                <div className="mt-1">{variationBadge}</div>
              )}
            </div>
          </div>
          {rightContent}
        </div>
      </BaseExerciseCard>
    );
  }
  
  // For selection variant
  if (variant === 'selection') {
    return (
      <BaseExerciseCard
        exercise={exercise}
        onClick={onSelect}
        isSelected={isSelected}
        className={className}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {thumbnail && <div className="mr-3">{thumbnail}</div>}
            <h3 className="font-medium text-gray-100">{exerciseName}</h3>
          </div>
          {onAdd && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
              className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
            >
              <Plus size={16} />
            </Button>
          )}
        </div>
      </BaseExerciseCard>
    );
  }
  
  // For workout-add variant (adding exercises to a workout)
  if (variant === 'workout-add') {
    return (
      <BaseExerciseCard
        exercise={exercise}
        className={className}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {thumbnail && <div className="mr-3">{thumbnail}</div>}
            <h3 className="font-medium text-gray-100">{exerciseName}</h3>
          </div>
          {onAdd && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onAdd}
              className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 rounded-full"
            >
              <Plus size={16} />
            </Button>
          )}
        </div>
      </BaseExerciseCard>
    );
  }
  
  // For workout variant (exercises in an active workout)
  if (variant === 'workout') {
    return (
      <BaseExerciseCard
        exercise={exercise}
        className={className}
        isActive={isActive}
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {thumbnail && <div className="mr-3">{thumbnail}</div>}
              <div>
                <h3 className="font-medium text-gray-100">{exerciseName}</h3>
                {sets && sets.length > 0 && (
                  <p className="text-sm text-gray-400">
                    {sets.filter(s => s.completed).length}/{sets.length} sets completed
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex">
              {onDeleteExercise && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDeleteExercise}
                  className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-full"
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          </div>
          
          {/* Custom content for sets table or other content */}
          {customContent}
        </div>
      </BaseExerciseCard>
    );
  }
  
  // For compact variant
  if (variant === 'compact') {
    return (
      <BaseExerciseCard
        exercise={exercise}
        onClick={onSelect}
        className={cn("py-2 px-3", className)}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-100">{exerciseName}</h3>
          {onAdd && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 p-0" 
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </BaseExerciseCard>
    );
  }
  
  // Default variant
  return (
    <BaseExerciseCard
      exercise={exercise}
      onClick={onSelect}
      className={className}
    >
      <div className="flex items-center justify-between">
        {thumbnail && <div className="mr-3">{thumbnail}</div>}
        <h3 className="font-medium text-gray-100">{exerciseName}</h3>
        {onAdd && (
          <Button variant="ghost" size="sm" onClick={onAdd}>
            <Plus size={16} className="mr-1" />
            Add
          </Button>
        )}
      </div>
    </BaseExerciseCard>
  );
};
