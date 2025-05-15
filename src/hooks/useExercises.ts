
import { useExercises as useExercisesHook } from './exercise';

// Re-export the useExercises hook for backward compatibility
export const useExercises = useExercisesHook;

// Re-export types for backward compatibility
export type {
  ExerciseMetadata,
  ExerciseInput,
  ExerciseUpdateInput,
  ExerciseSortBy,
  SortOrder
} from './exercise/types';
