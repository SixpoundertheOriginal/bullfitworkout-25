import React from 'react';
import { Exercise, MuscleGroup } from '@/types/exercise';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Plus, Edit, Trash, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExerciseCardProps {
  exerciseName: string;
  exerciseData?: Exercise;
  className?: string;
  isVariation?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
  onAddVariation?: () => void;
  expanded?: boolean; 
  toggleExpand?: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exerciseName,
  exerciseData,
  className,
  isVariation = false,
  onSelect,
  onEdit,
  onDelete,
  onAdd,
  onAddVariation,
  expanded,
  toggleExpand
}) => {
  const renderMuscleGroups = (muscles?: MuscleGroup[]) => {
    if (!muscles || !muscles.length) return null;
    return muscles.slice(0, 3).map((muscle, i) => (
      <Badge key={i} variant="outline" className="text-xs bg-gray-800/50 border-gray-700">
        {muscle}
      </Badge>
    ));
  };

  const handleClick = (e: React.MouseEvent) => {
    // If this is clickable to select an exercise
    if (onSelect) {
      e.stopPropagation();
      onSelect();
    }
    // If this is expandable
    else if (toggleExpand) {
      e.stopPropagation();
      toggleExpand();
    }
  };
  
  // Get description only if we have a full exercise object
  const description = exerciseData?.description;
  
  // Get muscle groups only if we have a full exercise object
  const muscleGroups = exerciseData?.primary_muscle_groups;

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all border-gray-800 hover:border-gray-700 bg-gray-900/40",
        isVariation && "border-l-purple-700 border-l-2",
        onSelect && "cursor-pointer hover:bg-gray-800/40",
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-gray-400" />
              <h3 className="font-medium text-white">{exerciseName}</h3>
              {expanded !== undefined && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 w-6 p-0 ml-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (toggleExpand) toggleExpand();
                  }}
                >
                  {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              )}
            </div>
            
            {description && (
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">{description}</p>
            )}
            
            {muscleGroups && muscleGroups.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {renderMuscleGroups(muscleGroups)}
                {muscleGroups.length > 3 && (
                  <span className="text-xs text-gray-500">+{muscleGroups.length - 3} more</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex shrink-0 space-x-2 ml-2">
            {onAdd && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2 bg-purple-900/20 border-purple-800/30 hover:bg-purple-800/30"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd();
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            
            {onAddVariation && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2 bg-gray-800 border-gray-700 hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddVariation();
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Variation
              </Button>
            )}
            
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-gray-800"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseCard;
