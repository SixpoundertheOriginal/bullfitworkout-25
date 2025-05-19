
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listExercises, createExercise as createExerciseAPI, updateExercise as updateExerciseAPI, deleteExercise as deleteExerciseAPI } from '@/services/exerciseService';
import { ExerciseInput, ExerciseUpdateInput } from './types';

const EXERCISES_QUERY_KEY = 'exercises';

export function useExercises() {
  const queryClient = useQueryClient();

  // Fetch all exercises
  const { data: exercises, isLoading, error, isError } = useQuery({
    queryKey: [EXERCISES_QUERY_KEY],
    queryFn: () => listExercises()
  });

  // Function to normalize exercise data before creating
  function normalizeExerciseForCreate(exercise: any): ExerciseInput {
    // Ensure we have valid steps array in instructions
    const instructions = exercise.instructions || {};
    
    return {
      ...exercise,
      instructions: {
        ...instructions,
        steps: Array.isArray(instructions.steps) ? instructions.steps : []
      }
    };
  }

  // Mutation to create a new exercise
  const createExerciseMutation = useMutation({
    mutationFn: (exercise: ExerciseInput) => createExerciseAPI(exercise),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXERCISES_QUERY_KEY] });
    },
    onError: (error) => {
      console.error("Error creating exercise:", error);
    }
  });

  // Mutation to update an existing exercise
  const updateExerciseMutation = useMutation({
    mutationFn: (exercise: ExerciseUpdateInput) => updateExerciseAPI(exercise),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXERCISES_QUERY_KEY] });
    },
    onError: (error) => {
      console.error("Error updating exercise:", error);
    }
  });

  // Mutation to delete an exercise
  const deleteExerciseMutation = useMutation({
    mutationFn: (id: string) => deleteExerciseAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXERCISES_QUERY_KEY] });
    },
    onError: (error) => {
      console.error("Error deleting exercise:", error);
    }
  });

  return {
    exercises: exercises || [],
    isLoading,
    error,
    isError,
    createExercise: (exercise: ExerciseInput, options?: { onSuccess?: () => void, onError?: (error: any) => void }) => {
      createExerciseMutation.mutate(normalizeExerciseForCreate(exercise), {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [EXERCISES_QUERY_KEY] });
          options?.onSuccess?.();
        },
        onError: (error) => {
          console.error("Error creating exercise:", error);
          options?.onError?.(error);
        }
      });
    },
    updateExercise: (exercise: ExerciseUpdateInput, options?: { onSuccess?: () => void, onError?: (error: any) => void }) => {
      updateExerciseMutation.mutate(exercise, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [EXERCISES_QUERY_KEY] });
          options?.onSuccess?.();
        },
        onError: (error) => {
          console.error("Error updating exercise:", error);
          options?.onError?.(error);
        }
      });
    },
    deleteExercise: (id: string, options?: { onSuccess?: () => void, onError?: (error: any) => void }) => {
      deleteExerciseMutation.mutate(id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [EXERCISES_QUERY_KEY] });
          options?.onSuccess?.();
        },
        onError: (error) => {
          console.error("Error deleting exercise:", error);
          options?.onError?.(error);
        }
      });
    },
    isPending: createExerciseMutation.isPending || updateExerciseMutation.isPending || deleteExerciseMutation.isPending,
    isCreating: createExerciseMutation.isPending,
    isUpdating: updateExerciseMutation.isPending,
    isDeleting: deleteExerciseMutation.isPending,

    // Additional functions for exercise management
    getBaseExercises: () => (exercises || []).filter((ex: any) => !ex.base_exercise_id),
    getVariationsForExercise: (baseExerciseId: string) => 
      (exercises || []).filter((ex: any) => ex.base_exercise_id === baseExerciseId),
    getSortedExercises: (sortBy: string = 'name', sortOrder: string = 'asc') => {
      const sortedExercises = [...(exercises || [])];
      return sortedExercises.sort((a: any, b: any) => {
        const valueA = a[sortBy];
        const valueB = b[sortBy];
        
        if (sortOrder === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
    }
  };
}
