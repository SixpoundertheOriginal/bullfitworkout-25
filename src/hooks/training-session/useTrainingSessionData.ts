
import { useMemo } from 'react';
import { WorkoutExercises } from '@/store/workout/types';

/**
 * Hook that provides computed/derived properties for the training session
 */
export const useTrainingSessionData = (exercises: WorkoutExercises, focusedExercise: string | null) => {
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
    // Fixed: lastCompletedExercise is a string, not a property of exercises
    const lastCompletedExercise = exercises.lastCompletedExercise as unknown as string;
    // Fixed: lastCompletedSetIndex is a number, not a property of exercises
    const lastCompletedSetIndex = exercises.lastCompletedSetIndex as unknown as number;

    if (!lastCompletedExercise || lastCompletedSetIndex === null || lastCompletedSetIndex === undefined) {
      return null;
    }
    
    // Fixed: Get the sets for the completed exercise properly
    const exerciseSets = exercises[lastCompletedExercise];
    if (!exerciseSets) return null;
    
    // Check if there is a next set for this exercise
    const nextSetIndex = lastCompletedSetIndex + 1;
    if (nextSetIndex < exerciseSets.length) {
      const nextSet = exerciseSets[nextSetIndex];
      // Access set number through index instead of metadata
      const setNumber = nextSetIndex + 1;
      
      return {
        exerciseName: lastCompletedExercise,
        setNumber: setNumber,
        weight: nextSet.weight,
        reps: nextSet.reps,
        isLastSet: nextSetIndex === exerciseSets.length - 1
      };
    }
    
    // If no next set in current exercise, find the next exercise
    const currentExerciseIndex = exerciseNames.indexOf(lastCompletedExercise);
    const nextExerciseIndex = currentExerciseIndex + 1;
    
    if (nextExerciseIndex < exerciseNames.length) {
      const nextExercise = exerciseNames[nextExerciseIndex];
      const nextExerciseSets = exercises[nextExercise];
      
      if (nextExerciseSets && nextExerciseSets.length > 0) {
        const nextSet = nextExerciseSets[0];
        // Use index + 1 for set number
        const setNumber = 1;
        
        return {
          exerciseName: nextExercise,
          setNumber: setNumber,
          weight: nextSet.weight,
          reps: nextSet.reps,
          isNewExercise: true
        };
      }
    }
    
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
