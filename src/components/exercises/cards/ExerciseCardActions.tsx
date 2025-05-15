
import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, Check, Copy, Info } from 'lucide-react';

interface ExerciseCardActionsProps {
  variant?: 'list' | 'selector' | 'workout-add' | 'library-manage' | 'workout';
  isSelected?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
  onViewDetails?: () => void;
  onDuplicate?: () => void;
}

export const ExerciseCardActions: React.FC<ExerciseCardActionsProps> = ({
  variant = 'list',
  isSelected = false,
  onEdit,
  onDelete,
  onAdd,
  onViewDetails,
  onDuplicate
}) => {
  return (
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
      
      {variant === 'library-manage' && (
        <>
          {onViewDetails && (
            <Button 
              size="icon"
              variant="ghost" 
              className="h-8 w-8 text-purple-500 hover:text-purple-400 hover:bg-purple-900/20"
              onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
            >
              <Info size={16} />
            </Button>
          )}
          {onDuplicate && (
            <Button 
              size="icon"
              variant="ghost" 
              className="h-8 w-8 text-cyan-500 hover:text-cyan-400 hover:bg-cyan-900/20"
              onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            >
              <Copy size={16} />
            </Button>
          )}
        </>
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
  );
};
