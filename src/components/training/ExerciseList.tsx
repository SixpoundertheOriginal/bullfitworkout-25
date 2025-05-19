
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ExerciseSet } from "@/types/exercise";
import ExerciseCard from './ExerciseCard';
import { PlusCircle, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { WorkoutSessionFooter } from "./WorkoutSessionFooter";
import { useIsMobile } from "@/hooks/use-mobile";
import { safeRenderableExercise } from "@/utils/exerciseAdapter";

interface ExerciseListProps {
  exercises: Record<string, ExerciseSet[]>;
  activeExercise: string | null;
  focusedExercise?: string | null;
  onAddSet: (exerciseName: string) => void;
  onCompleteSet: (exerciseName: string, setIndex: number) => void;
  onDeleteExercise: (exerciseName: string) => void;
  onRemoveSet: (exerciseName: string, setIndex: number) => void;
  onEditSet: (exerciseName: string, setIndex: number) => void;
  onSaveSet: (exerciseName: string, setIndex: number) => void;
  onWeightChange: (exerciseName: string, setIndex: number, value: string) => void;
  onRepsChange: (exerciseName: string, setIndex: number, value: string) => void;
  onRestTimeChange: (exerciseName: string, setIndex: number, value: string) => void;
  onWeightIncrement: (exerciseName: string, setIndex: number, increment: number) => void;
  onRepsIncrement: (exerciseName: string, setIndex: number, increment: number) => void;
  onRestTimeIncrement: (exerciseName: string, setIndex: number, increment: number) => void;
  onShowRestTimer: () => void;
  onResetRestTimer: () => void;
  onFocusExercise?: (exerciseName: string | null) => void;
  onOpenAddExercise: () => void;
  onFinishWorkout: () => void;
  isSaving: boolean;
  onNextExercise?: () => void;
  hasMoreExercises?: boolean;
  setExercises: (exercises: Record<string, ExerciseSet[]> | ((prev: Record<string, ExerciseSet[]>) => Record<string, ExerciseSet[]>)) => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  activeExercise,
  focusedExercise,
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
  onFocusExercise,
  onOpenAddExercise,
  onFinishWorkout,
  isSaving,
  onNextExercise,
  hasMoreExercises = false,
  setExercises
}) => {
  const exerciseList = Object.keys(exercises);
  const isMobile = useIsMobile();
  
  // Function to handle adding a set that copies the previous set values
  const handleAddSet = (exerciseName: string) => {
    const existingSets = exercises[exerciseName];
    const lastSet = existingSets.length > 0 ? existingSets[existingSets.length - 1] : null;
    
    // Call the onAddSet function that was passed as prop
    onAddSet(exerciseName);
    
    // If there's a last set, update the newly created set with its values
    if (lastSet && existingSets.length > 0) {
      // We need to access the new set that was just added
      setTimeout(() => {
        setExercises(prev => {
          const updatedExercises = { ...prev };
          const sets = [...updatedExercises[exerciseName]];
          const newSetIndex = sets.length - 1;
          
          if (newSetIndex >= 0) {
            // Clone the last set's values to the new set
            sets[newSetIndex] = {
              ...sets[newSetIndex],
              weight: lastSet.weight,
              reps: lastSet.reps,
              restTime: lastSet.restTime || 60
            };
          }
          
          updatedExercises[exerciseName] = sets;
          return updatedExercises;
        });
      }, 0);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 }
  };

  if (exerciseList.length === 0) {
    return (
      <div className="container max-w-5xl mx-auto pb-10">
        <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/70 border-white/5 overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-purple-900/20 flex items-center justify-center mb-4">
              <Dumbbell className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">No exercises added yet</h3>
            <p className="text-gray-400 max-w-md mb-5">Start building your workout by adding exercises to track your sets, weights, and reps.</p>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={onOpenAddExercise}
                className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 shadow-lg shadow-purple-900/20 h-11 px-6"
                size="lg"
              >
                <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Exercise
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto">
      <motion.div 
        className="space-y-3 pb-10"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {exerciseList.map(exerciseName => (
          <motion.div key={exerciseName} variants={item} data-exercise={exerciseName}>
            <ExerciseCard
              exerciseName={exerciseName}
              sets={exercises[exerciseName]}
              isActive={activeExercise === exerciseName}
              isFocused={focusedExercise === exerciseName}
              onAddSet={() => handleAddSet(exerciseName)}
              onCompleteSet={(setIndex) => onCompleteSet(exerciseName, setIndex)}
              onDeleteExercise={() => onDeleteExercise(exerciseName)}
              onRemoveSet={(setIndex) => onRemoveSet(exerciseName, setIndex)}
              onEditSet={(setIndex) => onEditSet(exerciseName, setIndex)}
              onSaveSet={(setIndex) => onSaveSet(exerciseName, setIndex)}
              onWeightChange={(setIndex, value) => onWeightChange(exerciseName, setIndex, value)}
              onRepsChange={(setIndex, value) => onRepsChange(exerciseName, setIndex, value)}
              onRestTimeChange={(setIndex, value) => onRestTimeChange(exerciseName, setIndex, value)}
              onWeightIncrement={(setIndex, increment) => onWeightIncrement(exerciseName, setIndex, increment)}
              onRepsIncrement={(setIndex, increment) => onRepsIncrement(exerciseName, setIndex, increment)}
              onRestTimeIncrement={(setIndex, increment) => onRestTimeIncrement(exerciseName, setIndex, increment)}
              onShowRestTimer={onShowRestTimer}
              onResetRestTimer={onResetRestTimer}
              onFocus={onFocusExercise ? () => onFocusExercise(exerciseName) : undefined}
            />
          </motion.div>
        ))}
        
        {/* Integrated footer buttons */}
        <WorkoutSessionFooter
          onAddExercise={onOpenAddExercise}
          onFinishWorkout={onFinishWorkout}
          hasExercises={exerciseList.length > 0}
          isSaving={isSaving}
          focusedExercise={focusedExercise}
          onExitFocus={() => onFocusExercise && onFocusExercise(null)}
          visible={true}
          onNextExercise={onNextExercise}
          hasMoreExercises={hasMoreExercises}
        />
      </motion.div>
    </div>
  );
}
