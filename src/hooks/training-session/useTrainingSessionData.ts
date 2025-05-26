
import { useMemo } from 'react';
import { ExerciseSet } from '@/store/workout/types';

/**
 * Hook that provides computed/derived properties for the training session
 * Using store types directly to avoid type conflicts
 */
export const useTrainingSessionData = (exercises: Record<string, ExerciseSet[]>, focusedExercise: string | null) => {
  // Derived state
  const hasExercises = useMemo(() => Object.keys(exercises).length > 0, [exercises]);
  const exerciseCount = useMemo(() => Object.keys(exercises).length, [exercises]);
  
  const totalSets = useMemo(() => {
    return Object.values(exercises).reduce((total, sets) => total + sets.length, 0);
  }, [exercises]);
  
  const completedSets = useMemo(() => {
    return Object.values(exercises).reduce((total, sets) => {
      return total + sets.filter(set => set.completed).length;
    }, 0);
  }, [exercises]);
  
  const nextExerciseName = useMemo(() => {
    if (!focusedExercise) return null;
    
    const exerciseKeys = Object.keys(exercises);
    const currentIndex = exerciseKeys.indexOf(focusedExercise);
    
    if (currentIndex >= 0 && currentIndex < exerciseKeys.length - 1) {
      return exerciseKeys[currentIndex + 1];
    }
    
    return null;
  }, [exercises, focusedExercise]);

  // Get next set details for display in rest timer
  const getNextSetDetails = () => {
    const exerciseNames = Object.keys(exercises);
    
    // For now, return null since we don't have access to lastCompletedExercise metadata
    // This would need to be passed from the store separately
    return null;
  };

  return {
    hasExercises,
    exerciseCount,
    totalSets,
    completedSets,
    nextExerciseName,
    getNextSetDetails
  };
};
