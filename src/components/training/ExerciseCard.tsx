import React, { useState } from 'react';
import { Exercise, ExerciseSet } from '@/types/exercise';
import { CommonExerciseCard } from '../exercises/CommonExerciseCard';
import { ExerciseThumbnail } from '../exercises/cards/ExerciseThumbnail';
import { cn } from '@/lib/utils';
import { SetsTable } from '../workouts/SetsTable';
import { ExerciseMetricsDisplay } from './ExerciseMetricsDisplay';
import { motion } from 'framer-motion';
import { Dumbbell, Target } from 'lucide-react';

interface ExerciseCardProps {
  exercise: Exercise | string;
  onAdd?: (exercise: Exercise | string) => void;
  sets?: any[];
  isActive?: boolean;
  isFocused?: boolean;
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
  onFocus?: () => void;
  className?: string;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  exercise, 
  onAdd,
  sets = [],
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
  className
}) => {
  const [expanded, setExpanded] = useState(true);
  
  // Create thumbnail if exercise is an object with a media_url
  const thumbnail = typeof exercise !== 'string' ? 
    <ExerciseThumbnail 
      exercise={exercise} 
      className={cn(
        "transition-all duration-300",
        isActive ? "ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/20" : "",
        isFocused ? "ring-2 ring-purple-500/60 shadow-lg shadow-purple-500/30 scale-105" : ""
      )}
      size="lg"
    /> : 
    <div className={cn(
      "w-12 h-12 rounded-lg flex items-center justify-center",
      "bg-gradient-to-br from-purple-600/20 to-purple-800/20",
      "transition-all duration-300",
      isActive ? "ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/20" : "",
      isFocused ? "ring-2 ring-purple-500/60 shadow-lg shadow-purple-500/30 scale-110" : ""
    )}>
      {isFocused ? 
        <Target className="w-6 h-6 text-green-400 animate-pulse" /> : 
        <Dumbbell className="w-6 h-6 text-purple-400" />
      }
    </div>;

  // Handle set update
  const handleSetUpdate = (updatedSet: ExerciseSet) => {
    if (!sets) return;
    
    const setIndex = sets.findIndex(s => 
      s.set_number === updatedSet.set_number || s.id === updatedSet.id
    );
    
    if (setIndex === -1) return;
    
    if (updatedSet.completed && onCompleteSet) {
      onCompleteSet(setIndex);
    }
    
    if (onWeightChange && updatedSet.weight !== sets[setIndex].weight) {
      onWeightChange(setIndex, updatedSet.weight.toString());
    }
    
    if (onRepsChange && updatedSet.reps !== sets[setIndex].reps) {
      onRepsChange(setIndex, updatedSet.reps.toString());
    }
    
    if (onRestTimeChange && updatedSet.restTime !== sets[setIndex].restTime) {
      onRestTimeChange(setIndex, updatedSet.restTime.toString());
    }
  };

  // Handle set deletion
  const handleSetDelete = (setToDelete: ExerciseSet) => {
    if (!sets) return;
    
    const setIndex = sets.findIndex(s => 
      s.set_number === setToDelete.set_number || s.id === setToDelete.id
    );
    
    if (setIndex === -1) return;
    
    if (onRemoveSet) {
      onRemoveSet(setIndex);
    }
  };

  // Custom content for the CommonExerciseCard
  const customContent = sets && sets.length > 0 ? (
    <div className="mt-4">
      <SetsTable
        sets={sets}
        onAddSet={onAddSet || (() => {})}
        onUpdateSet={handleSetUpdate}
        onDeleteSet={handleSetDelete}
        onShowRestTimer={onShowRestTimer || (() => {})}
        expanded={expanded}
        onToggleExpanded={() => setExpanded(!expanded)}
        onFocusSet={(setIndex) => onFocus && onFocus()}
        highlightActive={!!isFocused}
      />
      
      {/* Add exercise metrics display */}
      {sets.some(set => set.completed) && (
        <ExerciseMetricsDisplay
          sets={sets}
          exerciseName={typeof exercise === 'string' ? exercise : exercise.name}
          className="mt-2"
        />
      )}
    </div>
  ) : null;

  return (
    <motion.div
      whileHover={{ scale: isFocused ? 1.0 : 1.01 }}
      whileTap={{ scale: isFocused ? 1.0 : 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className={cn(
        "w-full",
        isActive ? "z-10" : "",
        isFocused ? "z-20" : "",
        className
      )}
      onClick={onFocus ? onFocus : undefined}
    >
      <CommonExerciseCard
        exercise={exercise}
        variant={onAdd ? "workout-add" : "workout"}
        onAdd={onAdd ? () => onAdd(exercise) : undefined}
        sets={sets}
        isActive={isActive}
        thumbnail={thumbnail}
        customContent={customContent}
        className={cn(
          "transition-all duration-300",
          "shadow-md hover:shadow-lg",
          "bg-gradient-to-br from-gray-900/90 to-gray-800/70",
          "border border-white/5",
          isActive ? "border-purple-500/40 shadow-lg shadow-purple-500/10" : "",
          isFocused ? "border-green-500/60 shadow-xl shadow-green-500/20 scale-[1.02]" : "",
          "tap-highlight-transparent",
          className
        )}
      />
    </motion.div>
  );
};

export default ExerciseCard;
