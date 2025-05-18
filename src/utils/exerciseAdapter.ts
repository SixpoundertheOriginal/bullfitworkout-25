
import { ExerciseSet as TypesExerciseSet } from '@/types/exercise';
import { ExerciseSet as StoreExerciseSet } from '@/store/workout/types';

/**
 * Adapts workout store exercise sets to the format expected by components
 */
export function adaptExerciseSets(
  storeExercises: Record<string, StoreExerciseSet[]>
): Record<string, TypesExerciseSet[]> {
  const adaptedExercises: Record<string, TypesExerciseSet[]> = {};
  
  Object.entries(storeExercises).forEach(([exerciseName, sets], exerciseIndex) => {
    adaptedExercises[exerciseName] = sets.map((set, index) => ({
      id: `${exerciseName}-set-${index}`,
      set_number: index + 1,
      exercise_name: exerciseName,
      workout_id: 'current-workout', // Placeholder until actual save
      weight: set.weight,
      reps: set.reps,
      restTime: set.restTime,
      completed: set.completed,
      isEditing: set.isEditing,
      metadata: set.metadata
    }));
  });
  
  return adaptedExercises;
}

/**
 * Adapts component exercise sets back to the store format
 */
export function adaptToStoreFormat(
  componentExercises: Record<string, TypesExerciseSet[]>
): Record<string, StoreExerciseSet[]> {
  const storeExercises: Record<string, StoreExerciseSet[]> = {};
  
  Object.entries(componentExercises).forEach(([exerciseName, sets]) => {
    storeExercises[exerciseName] = sets.map(set => ({
      weight: set.weight,
      reps: set.reps,
      restTime: set.restTime || 60, // Ensure restTime is always provided
      completed: set.completed,
      isEditing: set.isEditing || false,
      metadata: {
        autoAdjusted: false,
        previousValues: { 
          weight: set.weight,
          reps: set.reps,
          restTime: set.restTime || 60
        }
      }
    }));
  });
  
  return storeExercises;
}
