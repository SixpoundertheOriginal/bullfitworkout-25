
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ExerciseSet } from "@/store/workout/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowRight, Pencil, Trash2, CheckCircle2, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SafeExerciseName } from '@/components/exercises/SafeExerciseName';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { SetRow } from "./SetRow";
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "@/components/ui/separator";

interface ExerciseCardProps {
  exerciseName: string;
  sets: ExerciseSet[];
  isActive: boolean;
  isFocused: boolean;
  onAddSet: () => void;
  onCompleteSet: (setIndex: number) => void;
  onDeleteExercise: () => void;
  onRemoveSet: (setIndex: number) => void;
  onEditSet: (setIndex: number) => void;
  onSaveSet: (setIndex: number) => void;
  onWeightChange: (setIndex: number, value: string) => void;
  onRepsChange: (setIndex: number, value: string) => void;
  onRestTimeChange: (setIndex: number, value: string) => void;
  onWeightIncrement: (setIndex: number, increment: number) => void;
  onRepsIncrement: (setIndex: number, increment: number) => void;
  onRestTimeIncrement: (setIndex: number, increment: number) => void;
  onShowRestTimer: () => void;
  onResetRestTimer: () => void;
  onFocus?: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exerciseName,
  sets,
  isActive,
  isFocused,
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
  onFocus
}) => {
  const [allCompleted, setAllCompleted] = useState(false);
  const isMobile = useIsMobile();

  // Check if all sets are completed
  useEffect(() => {
    const completed = sets.every(set => set.completed);
    setAllCompleted(completed && sets.length > 0);
  }, [sets]);
  
  // Calculate how many sets are completed
  const completedCount = sets.filter(set => set.completed).length;
  const totalSets = sets.length;
  const progressPercentage = totalSets > 0 ? (completedCount / totalSets) * 100 : 0;

  const handleCardClick = () => {
    if (onFocus && !isFocused) {
      onFocus();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      onClick={handleCardClick}
      className={cn(
        "mb-4 relative overflow-hidden",
        isFocused ? "z-20" : "z-10",
        onFocus && !isFocused ? "cursor-pointer" : ""
      )}
    >
      <Card 
        className={cn(
          "transition-all duration-300 overflow-hidden",
          isActive ? "border-purple-500/40 shadow-lg shadow-purple-900/10" : "border-gray-800",
          allCompleted ? "border-green-500/30 bg-gradient-to-br from-green-900/10 to-transparent" : "",
          isFocused ? "ring-2 ring-purple-500" : ""
        )}
      >
        {/* Progress bar */}
        {totalSets > 0 && progressPercentage > 0 && (
          <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${progressPercentage}%` }}></div>
        )}
        
        <div className="p-4">
          {/* Exercise header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="flex flex-col">
                <div className="flex items-center">
                  <SafeExerciseName 
                    exercise={exerciseName} 
                    className="font-semibold text-lg text-white" 
                  />
                  {isFocused && <ArrowRight size={16} className="ml-2 text-purple-400" />}
                </div>
                {totalSets > 0 && (
                  <div className="text-sm text-gray-400">
                    {completedCount}/{totalSets} sets completed
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {allCompleted ? (
                <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-500/30">
                  <CheckCircle2 size={12} className="mr-1" /> Completed
                </Badge>
              ) : (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSet();
                  }}
                  size="sm"
                  className="bg-purple-900/20 border-purple-700/30 hover:bg-purple-800/30"
                  variant="outline"
                >
                  <PlusCircle size={14} className="mr-1" />
                  <span className="text-xs">Add Set</span>
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                  <DropdownMenuItem
                    className="text-red-400 focus:text-red-400 focus:bg-red-950/50"
                    onClick={onDeleteExercise}
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete Exercise
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Exercise sets */}
          {sets.length > 0 ? (
            <div>
              {/* Header row */}
              <div className="grid grid-cols-12 gap-2 mb-1 px-1 text-xs text-gray-500">
                <div className="col-span-2">#</div>
                <div className="col-span-3 text-center">Weight</div>
                <div className="col-span-3 text-center">Reps</div>
                <div className="col-span-2 text-center">Rest</div>
                <div className="col-span-2"></div>
              </div>
              <Separator className="my-1 bg-gray-800" />
              
              {/* Set rows */}
              <div className="space-y-2 mt-2">
                {sets.map((set, index) => (
                  <SetRow
                    key={`${exerciseName}-set-${index}-${set.id || index}`}
                    set={set}
                    index={index}
                    onComplete={() => onCompleteSet(index)}
                    onEdit={() => onEditSet(index)}
                    onSave={() => onSaveSet(index)}
                    onRemove={() => onRemoveSet(index)}
                    onWeightChange={(value) => onWeightChange(index, value)}
                    onRepsChange={(value) => onRepsChange(index, value)}
                    onRestTimeChange={(value) => onRestTimeChange(index, value)}
                    onWeightIncrement={(inc) => onWeightIncrement(index, inc)}
                    onRepsIncrement={(inc) => onRepsIncrement(index, inc)}
                    onRestTimeIncrement={(inc) => onRestTimeIncrement(index, inc)}
                    onShowRestTimer={onShowRestTimer}
                    onResetRestTimer={onResetRestTimer}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-800/30 rounded-md">
              <p className="text-gray-400">No sets added yet</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddSet();
                }}
                className="mt-2"
              >
                <PlusCircle size={16} className="mr-2" /> Add First Set
              </Button>
            </div>
          )}
          
          {/* Exercise actions footer */}
          {sets.length > 0 && !allCompleted && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddSet();
                }}
                className="bg-purple-900/10 hover:bg-purple-900/20"
              >
                <PlusCircle size={16} className="mr-2" /> Add Set
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default ExerciseCard;
