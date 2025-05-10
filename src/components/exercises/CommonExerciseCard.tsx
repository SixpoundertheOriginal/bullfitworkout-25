
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Edit, Trash2, Plus, Check } from 'lucide-react';
import { Exercise } from '@/types/exercise';
import { Badge } from '@/components/ui/badge';

interface CommonExerciseCardProps {
  exercise: Exercise;
  variant: 'list' | 'selector' | 'workout-add';
  className?: string;
  onSelect?: () => void;
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isSelected?: boolean;
  isVariation?: boolean;
  rightContent?: React.ReactNode;
  variationBadge?: React.ReactNode;
}

export const CommonExerciseCard: React.FC<CommonExerciseCardProps> = ({
  exercise,
  variant,
  className,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  isSelected = false,
  isVariation = false,
  rightContent,
  variationBadge
}) => {
  // Determine appropriate handlers based on variant
  const handleClick = () => {
    if (variant === 'selector' && onSelect) {
      onSelect();
    } else if (variant === 'workout-add' && onAdd) {
      onAdd();
    }
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        variant === 'selector' ? "cursor-pointer" : "",
        isSelected ? "border-purple-500 ring-1 ring-purple-500/30" : "border-gray-800",
        isVariation ? "bg-gray-900/60" : "bg-gray-900",
        className
      )}
      onClick={variant === 'selector' ? handleClick : undefined}
    >
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex flex-col flex-grow mr-2">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-gray-100">{exercise.name}</h3>
            
            {/* Display variation badge if provided */}
            {variationBadge && (
              <div className="ml-2">{variationBadge}</div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1 mt-1">
            {exercise.primary_muscle_groups.slice(0, 3).map((muscle, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="text-xs bg-gray-800/60 border-gray-700/50 text-gray-300"
              >
                {muscle}
              </Badge>
            ))}
            
            {exercise.equipment_type.slice(0, 1).map((equipment, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="text-xs bg-gray-800/80 border-gray-700/50 text-gray-400"
              >
                {equipment}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Right side content - either custom content or action buttons */}
        {rightContent ? (
          <div>{rightContent}</div>
        ) : (
          <div className="flex items-center space-x-1">
            {variant === 'workout-add' && onAdd && (
              <Button 
                size="icon" 
                variant="ghost"
                className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-900/20"
                onClick={(e) => { e.stopPropagation(); onAdd(); }}
              >
                <Plus size={18} />
              </Button>
            )}
            
            {variant === 'selector' && isSelected && (
              <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Check size={16} className="text-purple-400" />
              </div>
            )}
            
            {onEdit && (
              <Button 
                size="icon"
                variant="ghost" 
                className="h-8 w-8 text-blue-500 hover:text-blue-400 hover:bg-blue-900/20"
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
              >
                <Edit size={16} />
              </Button>
            )}
            
            {onDelete && (
              <Button 
                size="icon"
                variant="ghost" 
                className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-900/20"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
