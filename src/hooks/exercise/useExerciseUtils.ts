
import { ExerciseSortBy, SortOrder } from './types';
import { useExercises } from './useExerciseQueries';

/**
 * Combined hook that provides all exercise-related functionality
 */
export const useExercises as useExercisesUtil = (initialSortBy: ExerciseSortBy = 'name', initialSortOrder: SortOrder = 'asc') => {
  const { 
    exercises, 
    getBaseExercises,
    getVariationsForExercise,
    getSortedExercises,
    isLoading, 
    error, 
    isError,
    createExercise,
    updateExercise,
    deleteExercise,
    isPending,
    isCreating,
    isUpdating,
    isDeleting
  } = useExercises();

  return {
    // Query results
    exercises,
    getBaseExercises,
    getVariationsForExercise,
    getSortedExercises,
    isLoading,
    error,
    isError,
    
    // Mutations
    createExercise,
    updateExercise,
    deleteExercise,
    
    // Loading states
    isPending,
    isCreating,
    isUpdating,
    isDeleting
  };
};
