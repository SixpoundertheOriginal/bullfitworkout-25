
import { useMemo } from 'react';
import { WorkoutExercises } from '@/store/workout/types';

/**
 * Hook that provides computed/derived data from training session state
 * PHASE 1: Simplified to prevent render issues
 */
export const useTrainingSessionData = (exercises: WorkoutExercises, focusedExercise?: string | null) => {
  // Memoize computed values to prevent unnecessary recalculations
  const computedData = useMemo(() => {
    const exerciseList = Object.keys(exercises);
    const hasExercises = exerciseList.length > 0;
    const exerciseCount = exerciseList.length;
    
    // Calculate total and completed sets
    let totalSets = 0;
    let completedSets = 0;
    
    Object.values(exercises).forEach(sets => {
      totalSets += sets.length;
      completedSets += sets.filter(set => set.completed).length;
    });
    
    // Find next exercise name
    let nextExerciseName: string | null = null;
    if (focusedExercise) {
      const currentIndex = exerciseList.indexOf(focusedExercise);
      if (currentIndex >= 0 && currentIndex < exerciseList.length - 1) {
        nextExerciseName = exerciseList[currentIndex + 1];
      }
    }
    
    return {
      hasExercises,
      exerciseCount,
      totalSets,
      completedSets,
      nextExerciseName,
      exerciseList
    };
  }, [exercises, focusedExercise]);
  
  // Simple function to get next set details
  const getNextSetDetails = useMemo(() => {
    return (exerciseName: string) => {
      const sets = exercises[exerciseName] || [];
      const nextIncompleteSet = sets.find(set => !set.completed);
      return nextIncompleteSet || null;
    };
  }, [exercises]);
  
  return {
    ...computedData,
    getNextSetDetails
  };
};
