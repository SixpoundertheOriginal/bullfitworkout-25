
import { ExerciseSortBy, SortOrder } from './types';
import { useExerciseQueries } from './useExerciseQueries';
import { useExerciseCreate } from './useExerciseCreate';
import { useExerciseUpdate } from './useExerciseUpdate';
import { useExerciseDelete } from './useExerciseDelete';

/**
 * Combined hook that provides all exercise-related functionality
 */
export const useExercises = (initialSortBy: ExerciseSortBy = 'name', initialSortOrder: SortOrder = 'asc') => {
  const { 
    exercises, 
    getBaseExercises,
    getVariationsForExercise,
    getSortedExercises,
    isLoading, 
    error, 
    isError 
  } = useExerciseQueries(initialSortBy, initialSortOrder);
  
  const { createExercise, isCreating } = useExerciseCreate();
  const { updateExercise, isUpdating } = useExerciseUpdate();
  const { deleteExercise, isDeleting } = useExerciseDelete();

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
    isPending: isCreating,
    isCreating,
    isUpdating,
    isDeleting
  };
};
