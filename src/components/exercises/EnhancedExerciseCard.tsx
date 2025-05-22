
import React from 'react';
import { Exercise } from '@/types/exercise';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dumbbell, 
  Plus, 
  Edit, 
  Trash, 
  ChevronRight, 
  ChevronDown,
  Info,
  BarChart3,
  Clipboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useHaptics } from '@/hooks/use-haptics';

interface EnhancedExerciseCardProps {
  exerciseName: string;
  exerciseData?: Exercise;
  className?: string;
  isVariation?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
  onAddVariation?: () => void;
  onViewDetails?: () => void;
  expanded?: boolean; 
  toggleExpand?: () => void;
}

export const EnhancedExerciseCard: React.FC<EnhancedExerciseCardProps> = ({
  exerciseName,
  exerciseData,
  className,
  isVariation = false,
  onSelect,
  onEdit,
  onDelete,
  onAdd,
  onAddVariation,
  onViewDetails,
  expanded,
  toggleExpand
}) => {
  const { triggerHaptic } = useHaptics();
  
  const renderMuscleGroups = (muscles?: string[]) => {
    if (!muscles || !muscles.length) return null;
    return muscles.slice(0, 3).map((muscle, i) => (
      <Badge key={i} variant="outline" className="text-xs bg-gray-800/50 border-gray-700 capitalize">
        {muscle}
      </Badge>
    ));
  };

  const handleClick = (e: React.MouseEvent) => {
    // If this is clickable to select an exercise
    if (onSelect) {
      e.stopPropagation();
      triggerHaptic('selection');
      onSelect();
    }
    // If this is expandable
    else if (toggleExpand) {
      e.stopPropagation();
      triggerHaptic('selection');
      toggleExpand();
    }
  };
  
  // Get description only if we have a full exercise object
  const description = exerciseData?.description;
  
  // Get muscle groups only if we have a full exercise object
  const muscleGroups = exerciseData?.primary_muscle_groups;
  
  // Get equipment types
  const equipmentTypes = exerciseData?.equipment_type;
  
  // Get difficulty and map to color
  const difficulty = exerciseData?.difficulty;
  const difficultyColor = {
    'beginner': 'bg-green-900/20 text-green-500 border-green-700/20',
    'intermediate': 'bg-blue-900/20 text-blue-500 border-blue-700/20',
    'advanced': 'bg-orange-900/20 text-orange-500 border-orange-700/20',
    'expert': 'bg-red-900/20 text-red-500 border-red-700/20',
  }[difficulty as string] || 'bg-gray-800/50 border-gray-700';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={cn(
          "relative overflow-hidden transition-all border-gray-800 hover:border-gray-700 bg-gray-900/40",
          isVariation && "border-l-purple-700 border-l-2",
          onSelect && "cursor-pointer hover:bg-gray-800/40",
          expanded && "ring-1 ring-purple-500/50",
          "ios-press-animation",
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
                
                {difficulty && (
                  <Badge variant="outline" className={cn("text-xs ml-2", difficultyColor)}>
                    {difficulty}
                  </Badge>
                )}
                
                {expanded !== undefined && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0 ml-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic('selection');
                      if (toggleExpand) toggleExpand();
                    }}
                    haptic
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
              
              {equipmentTypes && equipmentTypes.length > 0 && (
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <span className="mr-1">Equipment:</span>
                  {equipmentTypes.slice(0, 2).map((equipment, i) => (
                    <span key={i} className="capitalize mr-1">
                      {equipment}{i < Math.min(equipmentTypes.length, 2) - 1 ? ',' : ''}
                    </span>
                  ))}
                  {equipmentTypes.length > 2 && <span>+{equipmentTypes.length - 2} more</span>}
                </div>
              )}
            </div>
            
            <div className="flex shrink-0 space-x-1 ml-2">
              {onViewDetails && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-blue-500 hover:text-blue-400 hover:bg-blue-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('selection');
                    onViewDetails();
                  }}
                  haptic
                >
                  <Info className="h-4 w-4" />
                </Button>
              )}
              
              {onAdd && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 bg-purple-900/20 border-purple-800/30 hover:bg-purple-800/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('selection');
                    onAdd();
                  }}
                  haptic
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
                    triggerHaptic('selection');
                    onAddVariation();
                  }}
                  haptic
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
                    triggerHaptic('selection');
                    onEdit();
                  }}
                  haptic
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
                    triggerHaptic('warning');
                    onDelete();
                  }}
                  haptic
                  hapticPattern="warning"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnhancedExerciseCard;
