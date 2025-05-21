
import React from 'react';
import { ExerciseList } from "@/components/training/ExerciseList";
import { useTrainingSession } from "@/hooks/training-session";
import { WorkoutExercises } from '@/store/workout/types';

interface ExerciseListWrapperProps {
  adaptedExercises: Record<string, any[]>;
  safeActiveExercise: string | null;
  safeFocusedExercise: string | null;
  nextExerciseName: string | null;
  handleAddExercise?: (exerciseName: string | any) => void;
  exerciseCount: number;
  isComplete?: boolean;
  totalSets: number;
  completedSets: number;
  onFinishWorkout?: () => void;
  isSaving?: boolean;
  onOpenAddExercise?: () => void;
}

export const ExerciseListWrapper: React.FC<ExerciseListWrapperProps> = ({
  adaptedExercises,
  safeActiveExercise,
  safeFocusedExercise,
  nextExerciseName,
  handleAddExercise,
  exerciseCount,
  isComplete = false,
  totalSets,
  completedSets,
  onFinishWorkout,
  isSaving = false,
  onOpenAddExercise
}) => {
  const {
    handleAddSet,
    handleCompleteSet,
    deleteExercise,
    handleFocusExercise,
    handleNextExercise,
    handleShowRestTimer,
    triggerRestTimerReset,
    handleSetExercises
  } = useTrainingSession();
  
  // Create type-safe wrappers for passing to components
  const typeSafeHandleSetExercises = (
    exercisesUpdate: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)
  ) => {
    // Type assertion to match the expected signature
    handleSetExercises(exercisesUpdate as WorkoutExercises | ((prev: WorkoutExercises) => WorkoutExercises));
  };

  return (
    <ExerciseList
      exercises={adaptedExercises}
      activeExercise={safeActiveExercise}
      focusedExercise={safeFocusedExercise}
      onAddSet={handleAddSet}
      onCompleteSet={handleCompleteSet}
      onDeleteExercise={deleteExercise}
      onRemoveSet={(name, i) => {
        console.log(`Removing set ${i} from ${name}`);
        typeSafeHandleSetExercises(prev => {
          const updated = { ...prev };
          updated[name] = prev[name].filter((_, idx) => idx !== i);
          return updated;
        });
      }}
      onEditSet={(name, i) => {
        console.log(`Setting edit mode for set ${i} of ${name}`);
        typeSafeHandleSetExercises(prev => {
          const updated = { ...prev };
          updated[name] = prev[name].map((s, idx) => idx === i ? { ...s, isEditing: true } : s);
          return updated;
        });
      }}
      onSaveSet={(name, i) => {
        console.log(`Saving set ${i} of ${name}`);
        typeSafeHandleSetExercises(prev => {
          const updated = { ...prev };
          updated[name] = prev[name].map((s, idx) => idx === i ? { ...s, isEditing: false } : s);
          return updated;
        });
      }}
      onWeightChange={(name, i, v) => {
        console.log(`Changing weight for set ${i} of ${name} to ${v}`);
        typeSafeHandleSetExercises(prev => {
          const updated = { ...prev };
          const currentSets = [...prev[name]];
          currentSets[i] = { ...currentSets[i], weight: parseFloat(v) || 0 };
          updated[name] = currentSets;
          return updated;
        });
      }}
      onRepsChange={(name, i, v) => {
        console.log(`Changing reps for set ${i} of ${name} to ${v}`);
        typeSafeHandleSetExercises(prev => {
          const updated = { ...prev };
          const currentSets = [...prev[name]];
          currentSets[i] = { ...currentSets[i], reps: parseInt(v) || 0 };
          updated[name] = currentSets;
          return updated;
        });
      }}
      onRestTimeChange={(name, i, v) => {
        console.log(`Changing rest time for set ${i} of ${name} to ${v}`);
        typeSafeHandleSetExercises(prev => {
          const updated = { ...prev };
          const currentSets = [...prev[name]];
          currentSets[i] = { ...currentSets[i], restTime: parseInt(v) || 60 };
          updated[name] = currentSets;
          return updated;
        });
      }}
      onWeightIncrement={(name, i, inc) => {
        typeSafeHandleSetExercises(prev => {
          const updated = { ...prev };
          const currentSets = [...prev[name]];
          const currentWeight = currentSets[i].weight || 0;
          currentSets[i] = { ...currentSets[i], weight: Math.max(0, currentWeight + inc) };
          updated[name] = currentSets;
          return updated;
        });
      }}
      onRepsIncrement={(name, i, inc) => {
        typeSafeHandleSetExercises(prev => {
          const updated = { ...prev };
          const currentSets = [...prev[name]];
          const currentReps = currentSets[i].reps || 0;
          currentSets[i] = { ...currentSets[i], reps: Math.max(0, currentReps + inc) };
          updated[name] = currentSets;
          return updated;
        });
      }}
      onRestTimeIncrement={(name, i, inc) => {
        typeSafeHandleSetExercises(prev => {
          const updated = { ...prev };
          const currentSets = [...prev[name]];
          const currentRest = currentSets[i].restTime || 60;
          currentSets[i] = { ...currentSets[i], restTime: Math.max(0, currentRest + inc) };
          updated[name] = currentSets;
          return updated;
        });
      }}
      onShowRestTimer={handleShowRestTimer}
      onResetRestTimer={triggerRestTimerReset}
      onFocusExercise={handleFocusExercise}
      onOpenAddExercise={onOpenAddExercise}
      onFinishWorkout={onFinishWorkout}
      isSaving={isSaving}
      onNextExercise={handleNextExercise}
      hasMoreExercises={!!nextExerciseName}
      setExercises={typeSafeHandleSetExercises}
    />
  );
};
