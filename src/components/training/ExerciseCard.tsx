
import React from 'react';
import { Exercise, ExerciseSet } from '@/types/exercise';
import { CommonExerciseCard } from '../exercises/CommonExerciseCard';
import { ExerciseThumbnail } from '../exercises/cards/ExerciseThumbnail';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Plus, Clock, Check, Trash2, Edit, ChevronDown, ChevronUp } from "lucide-react";
import { useWeightUnit } from '@/context/WeightUnitContext';
import { motion, AnimatePresence } from "framer-motion";

interface ExerciseCardProps {
  exercise: Exercise | string;
  onAdd?: (exercise: Exercise | string) => void;
  sets?: any[];
  isActive?: boolean;
  onAddSet?: () => void;
  onCompleteSet?: (setIndex: number) => void;
  onDeleteExercise?: () => void;
  onRemoveSet?: (setIndex: number) => void;
  onEditSet?: (setIndex: number) => void;
  onSaveSet?: (setIndex: number) => void;
  onWeightChange?: (setIndex: number, value: string) => void;
  onRepsChange?: (setIndex: number, value: string) => void;
  onRestTimeChange?: (setIndex: number, value: string) => void;
  onWeightIncrement?: (setIndex: number, increment: number) => void;
  onRepsIncrement?: (setIndex: number, increment: number) => void;
  onRestTimeIncrement?: (setIndex: number, increment: number) => void;
  onShowRestTimer?: () => void;
  onResetRestTimer?: () => void;
  className?: string;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  exercise, 
  onAdd,
  sets = [],
  isActive,
  onAddSet,
  onCompleteSet,
  onDeleteExercise,
  onRemoveSet,
  onEditSet,
  onSaveSet,
  onWeightChange,
  onRepsChange,
  onRestTimeChange,
  onWeightIncrement,
  onRepsIncrement,
  onRestTimeIncrement,
  onShowRestTimer,
  onResetRestTimer,
  className
}) => {
  const [expanded, setExpanded] = React.useState(true);
  const { weightUnit } = useWeightUnit();
  
  // Create thumbnail if exercise is an object with a media_url
  const thumbnail = typeof exercise !== 'string' ? 
    <ExerciseThumbnail 
      exercise={exercise} 
      className={cn(
        "transition-all duration-300",
        isActive ? "ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/20" : ""
      )}
      size="lg"
    /> : 
    undefined;

  // Exercise Sets Table
  const renderSetsTable = () => {
    if (!sets || sets.length === 0) return null;
    
    return (
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 overflow-x-auto pb-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800/50">
                    <th className="py-2 px-3 text-left font-medium">Set</th>
                    <th className="py-2 px-3 text-right font-medium">Weight ({weightUnit})</th>
                    <th className="py-2 px-3 text-right font-medium">Reps</th>
                    <th className="py-2 px-3 text-right font-medium">Rest</th>
                    <th className="py-2 px-3 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sets.map((set, index) => (
                    <tr 
                      key={index} 
                      className={cn(
                        "border-b border-gray-800/30 last:border-0",
                        set.completed ? "bg-gray-800/20" : "",
                        set.isEditing ? "bg-gray-800/40" : ""
                      )}
                    >
                      <td className="py-3 px-3 font-mono">{set.set_number || index + 1}</td>
                      
                      <td className="py-3 px-3 text-right">
                        {set.isEditing ? (
                          <div className="flex items-center justify-end">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 p-0 mr-1" 
                              onClick={() => onWeightIncrement?.(index, -2.5)}
                            >
                              -
                            </Button>
                            <input
                              type="number"
                              value={set.weight || 0}
                              onChange={(e) => onWeightChange?.(index, e.target.value)}
                              className="w-16 bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-right text-sm"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 p-0 ml-1" 
                              onClick={() => onWeightIncrement?.(index, 2.5)}
                            >
                              +
                            </Button>
                          </div>
                        ) : (
                          <span className="font-semibold">{set.weight || 0}</span>
                        )}
                      </td>
                      
                      <td className="py-3 px-3 text-right">
                        {set.isEditing ? (
                          <div className="flex items-center justify-end">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 p-0 mr-1" 
                              onClick={() => onRepsIncrement?.(index, -1)}
                            >
                              -
                            </Button>
                            <input
                              type="number"
                              value={set.reps || 0}
                              onChange={(e) => onRepsChange?.(index, e.target.value)}
                              className="w-12 bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-right text-sm"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 p-0 ml-1" 
                              onClick={() => onRepsIncrement?.(index, 1)}
                            >
                              +
                            </Button>
                          </div>
                        ) : (
                          <span className="font-semibold">{set.reps || 0}</span>
                        )}
                      </td>
                      
                      <td className="py-3 px-3 text-right">
                        {set.isEditing ? (
                          <div className="flex items-center justify-end">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 p-0 mr-1" 
                              onClick={() => onRestTimeIncrement?.(index, -15)}
                            >
                              -
                            </Button>
                            <input
                              type="number"
                              value={set.restTime || 60}
                              onChange={(e) => onRestTimeChange?.(index, e.target.value)}
                              className="w-14 bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-right text-sm"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 p-0 ml-1" 
                              onClick={() => onRestTimeIncrement?.(index, 15)}
                            >
                              +
                            </Button>
                          </div>
                        ) : (
                          <span className="font-medium text-gray-300">{set.restTime || 60}s</span>
                        )}
                      </td>
                      
                      <td className="py-3 px-3 text-center">
                        {set.isEditing ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSaveSet?.(index)}
                            className="h-7 px-2 text-green-400 hover:bg-green-900/20"
                          >
                            Save
                          </Button>
                        ) : (
                          <div className="flex justify-center space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onCompleteSet?.(index)}
                              disabled={set.completed}
                              className={cn(
                                "h-7 w-7 rounded-full",
                                set.completed 
                                  ? "bg-green-500/20 text-green-400" 
                                  : "hover:bg-green-900/20 text-gray-400 hover:text-green-400"
                              )}
                            >
                              <Check size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEditSet?.(index)}
                              className="h-7 w-7 rounded-full text-gray-400 hover:text-blue-400 hover:bg-blue-900/20"
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onRemoveSet?.(index)}
                              className="h-7 w-7 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Card footer with actions
  const renderFooter = () => {
    if (!sets || !onAddSet) return null;
    
    return (
      <div className="mt-3 pt-3 border-t border-gray-800/50 flex flex-wrap justify-between items-center gap-2">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-8 px-3 bg-gray-800 border-gray-700 hover:bg-gray-700 flex items-center gap-1"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? "Hide Sets" : "Show Sets"}
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAddSet}
            className="h-8 px-3 bg-gray-800 border-gray-700 hover:bg-gray-700 flex items-center gap-1"
          >
            <Plus size={14} />
            Add Set
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onShowRestTimer}
            className="h-8 px-3 bg-gray-800 border-gray-700 hover:bg-gray-700 flex items-center gap-1"
          >
            <Clock size={14} />
            Rest
          </Button>
        </div>
      </div>
    );
  };

  // Custom content for the CommonExerciseCard
  const customContent = sets && sets.length > 0 ? (
    <>
      {renderSetsTable()}
      {renderFooter()}
    </>
  ) : null;

  return (
    <CommonExerciseCard
      exercise={exercise}
      variant={onAdd ? "workout-add" : "workout"}
      onAdd={onAdd ? () => onAdd(exercise) : undefined}
      sets={sets}
      isActive={isActive}
      onAddSet={onAddSet}
      onCompleteSet={onCompleteSet}
      onDeleteExercise={onDeleteExercise}
      thumbnail={thumbnail}
      customContent={customContent}
      className={cn(
        "transition-all duration-300",
        "shadow-md hover:shadow-lg",
        "bg-gradient-to-br from-gray-900/90 to-gray-800/70",
        "border border-white/5",
        isActive ? "border-purple-500/40 shadow-lg shadow-purple-500/10" : "",
        "active:scale-[0.99]",
        "tap-highlight-transparent",
        className
      )}
    />
  );
};

export default ExerciseCard;
