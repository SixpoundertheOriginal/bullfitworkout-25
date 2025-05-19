
import { ExerciseSet as TypesExerciseSet } from '@/types/exercise';
import { ExerciseSet as StoreExerciseSet } from '@/store/workout/types';

/**
 * Adapts workout store exercise sets to the format expected by components
 */
export function adaptExerciseSets(
  storeExercises: Record<string, StoreExerciseSet[]>
): Record<string, TypesExerciseSet[]> {
  const adaptedExercises: Record<string, TypesExerciseSet[]> = {};
  
  // Make sure we're working with valid input
  if (!storeExercises || typeof storeExercises !== 'object') {
    console.warn('Invalid storeExercises provided to adaptExerciseSets', storeExercises);
    return {};
  }
  
  Object.entries(storeExercises).forEach(([exerciseName, sets], exerciseIndex) => {
    // Skip entries with non-string keys (object keys)
    if (typeof exerciseName !== 'string') {
      console.warn('Invalid exercise key encountered in adaptExerciseSets:', exerciseName);
      return;
    }
    
    // Ensure we have a safe string key
    const safeExerciseName = safeRenderableExercise(exerciseName);
    
    adaptedExercises[safeExerciseName] = sets.map((set, index) => ({
      id: `${safeExerciseName}-set-${index}`,
      set_number: index + 1,
      exercise_name: safeExerciseName,
      workout_id: 'current-workout', // Placeholder until actual save
      weight: set.weight,
      reps: set.reps,
      // Ensure restTime is always provided and not undefined
      restTime: set.restTime || 60,
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
  
  // Make sure we're working with valid input
  if (!componentExercises || typeof componentExercises !== 'object') {
    console.warn('Invalid componentExercises provided to adaptToStoreFormat', componentExercises);
    return {};
  }
  
  Object.entries(componentExercises).forEach(([exerciseName, sets]) => {
    // Skip entries with non-string keys (object keys)
    if (typeof exerciseName !== 'string') {
      console.warn('Invalid exercise key encountered in adaptToStoreFormat:', exerciseName);
      return;
    }
    
    // Ensure we have a safe string key
    const safeExerciseName = safeRenderableExercise(exerciseName);
    
    storeExercises[safeExerciseName] = sets.map(set => ({
      weight: set.weight,
      reps: set.reps,
      // Ensure restTime is always provided and not undefined
      restTime: set.restTime || 60, 
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

/**
 * Type guard to check if input is an Exercise object
 * Important for runtime safety
 */
export function isExerciseObject(exercise: any): boolean {
  return exercise !== null && 
         typeof exercise === 'object' && 
         !Array.isArray(exercise) &&
         'name' in exercise &&
         typeof exercise.name === 'string';
}

/**
 * Ensures that an exercise identifier is always a string (name)
 * Enhanced to be more robust handling different input types
 */
export function getExerciseName(exercise: any): string {
  // Case 1: String input
  if (typeof exercise === 'string') {
    return exercise;
  }
  
  // Case 2: Object with name property
  if (isExerciseObject(exercise)) {
    return exercise.name;
  }
  
  // Case 3: Object with exercise_name property (like ExerciseSet)
  if (exercise && typeof exercise === 'object' && exercise.exercise_name) {
    return exercise.exercise_name;
  }
  
  // Case 4: Invalid input
  console.warn('Invalid exercise identifier', exercise);
  return 'Unknown Exercise';
}

/**
 * Safely access an exercise property, ensuring we have a valid exercise object
 */
export function safeGetExerciseProperty<T>(
  exercise: any, 
  property: string, 
  defaultValue: T
): T {
  if (!exercise || typeof exercise !== 'object') {
    return defaultValue;
  }
  
  return (exercise[property] as T) || defaultValue;
}

/**
 * Runtime safety wrapper for exercise renderable values
 * Prevents React errors with object children
 */
export function safeRenderableExercise(value: any): string {
  if (typeof value === 'string') {
    return value;
  }
  
  if (isExerciseObject(value)) {
    return value.name;
  }
  
  // Return a string representation or empty string to prevent React errors
  return String(value || 'Unknown');
}
