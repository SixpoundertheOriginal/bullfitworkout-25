
import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, ChevronUp, ChevronDown, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SetRow } from "@/components/SetRow";
import { ExerciseSet } from "@/types/exercise";
import { ExerciseCardActions } from "@/components/exercises/cards/ExerciseCardActions";
import { SafeExerciseName } from '@/components/exercises/SafeExerciseName';
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

const ExerciseCard: React.FC<ExerciseCardProps> = ({
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
  onFocus,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const completedSets = sets.filter(set => set.completed).length;
  const totalSets = sets.length;
  const progress = totalSets ? (completedSets / totalSets) * 100 : 0;
  
  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(prev => !prev);
  };
  
  const handleCardClick = () => {
    if (onFocus) {
      onFocus();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    setDeleteConfirmOpen(false);
    onDeleteExercise();
  };
  
  return (
    <>
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-300",
          isFocused ? "border-purple-500/50 bg-gradient-to-br from-purple-900/20 to-gray-900/90" : "bg-gray-900/90",
          "hover:border-gray-700"
        )}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <SafeExerciseName 
                  exercise={exerciseName} 
                  className="text-lg font-medium text-white truncate" 
                />
                
                {!isFocused && completedSets > 0 && (
                  <span className="ml-2 text-sm text-gray-400">
                    {completedSets}/{totalSets}
                  </span>
                )}
              </div>
              
              <div className="flex space-x-1">
                {!isFocused && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-900/20"
                    onClick={handleDeleteClick}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
                
                {!isFocused && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400"
                    onClick={toggleExpanded}
                  >
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </Button>
                )}
              </div>
            </div>
            
            {!isFocused && (
              <div className="w-full h-1 bg-gray-800 rounded-full mt-2">
                <div 
                  className="h-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-400" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className={cn(
          "transition-all duration-300",
          isFocused ? "block" : (expanded ? "block" : "hidden")
        )}>
          <div className="space-y-2">
            {sets.map((set, index) => (
              <SetRow
                key={`${exerciseName}-set-${index}`}
                set={set}
                index={index}
                onComplete={() => onCompleteSet(index)}
                onRemove={() => onRemoveSet(index)}
                onEdit={() => onEditSet(index)}
                onSave={() => onSaveSet(index)}
                onWeightChange={(value) => onWeightChange(index, value)}
                onRepsChange={(value) => onRepsChange(index, value)}
                onRestTimeChange={(value) => onRestTimeChange(index, value)}
                onWeightIncrement={(increment) => onWeightIncrement(index, increment)}
                onRepsIncrement={(increment) => onRepsIncrement(index, increment)}
                onRestTimeIncrement={(increment) => onRestTimeIncrement(index, increment)}
                onShowRestTimer={onShowRestTimer}
                onResetRestTimer={onResetRestTimer}
              />
            ))}
            
            <Button
              variant="outline"
              size="sm"
              className="w-full border-dashed border-gray-700 mt-2 hover:bg-gray-800/50"
              onClick={onAddSet}
            >
              <PlusCircle className="mr-1 h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs">Add Set</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Exercise</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{exerciseName}" from your workout? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white" 
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ExerciseCard;
