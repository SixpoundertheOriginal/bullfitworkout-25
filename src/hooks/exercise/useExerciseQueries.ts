import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listExercises, createExercise as createExerciseAPI, updateExercise as updateExerciseAPI, deleteExercise as deleteExerciseAPI } from '@/services/exerciseService';
import { ExerciseInput, ExerciseUpdateInput } from './types';

const EXERCISES_QUERY_KEY = 'exercises';

export function useExercises() {
  const queryClient = useQueryClient();

  // Fetch all exercises
  const { data: exercises, isLoading, error } = useQuery(
    [EXERCISES_QUERY_KEY],
    () => listExercises(),
    {
      retry: false,
    }
  );

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
  const createExercise = useMutation(
    (exercise: ExerciseInput) => createExerciseAPI(exercise),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([EXERCISES_QUERY_KEY]);
      },
      onError: (error) => {
        console.error("Error creating exercise:", error);
      }
    }
  );

  // Mutation to update an existing exercise
  const updateExercise = useMutation(
    (exercise: ExerciseUpdateInput) => updateExerciseAPI(exercise),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([EXERCISES_QUERY_KEY]);
      },
      onError: (error) => {
        console.error("Error updating exercise:", error);
      }
    }
  );

  // Mutation to delete an exercise
  const deleteExercise = useMutation(
    (id: string) => deleteExerciseAPI(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([EXERCISES_QUERY_KEY]);
      },
      onError: (error) => {
        console.error("Error deleting exercise:", error);
      }
    }
  );

  return {
    exercises: exercises || [],
    isLoading,
    error,
    createExercise: (exercise: ExerciseInput, options?: { onSuccess?: () => void, onError?: (error: any) => void }) => {
      createExercise.mutate(normalizeExerciseForCreate(exercise), {
        onSuccess: () => {
          queryClient.invalidateQueries([EXERCISES_QUERY_KEY]);
          options?.onSuccess?.();
        },
        onError: (error) => {
          console.error("Error creating exercise:", error);
          options?.onError?.(error);
        }
      });
    },
    updateExercise: (exercise: ExerciseUpdateInput, options?: { onSuccess?: () => void, onError?: (error: any) => void }) => {
      updateExercise.mutate(exercise, {
        onSuccess: () => {
          queryClient.invalidateQueries([EXERCISES_QUERY_KEY]);
          options?.onSuccess?.();
        },
        onError: (error) => {
          console.error("Error updating exercise:", error);
          options?.onError?.(error);
        }
      });
    },
    deleteExercise: (id: string, options?: { onSuccess?: () => void, onError?: (error: any) => void }) => {
      deleteExercise.mutate(id, {
        onSuccess: () => {
          queryClient.invalidateQueries([EXERCISES_QUERY_KEY]);
          options?.onSuccess?.();
        },
        onError: (error) => {
          console.error("Error deleting exercise:", error);
          options?.onError?.(error);
        }
      });
    },
    isPending: createExercise.isLoading || updateExercise.isLoading || deleteExercise.isLoading,
  };
}
