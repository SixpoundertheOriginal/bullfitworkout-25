
// This file is maintained for backward compatibility
// All functionality has been migrated to the workout directory
import {
  useWorkoutStore,
  useWorkoutTimer,
  useWorkoutPageVisibility
} from './workout';

// Re-export everything
export {
  useWorkoutStore,
  useWorkoutTimer,
  useWorkoutPageVisibility
};

// Re-export types from the correct location
export type {
  WorkoutState,
} from './workout/types';

export type {
  ExerciseSet,
  WorkoutExercises,
  WorkoutStatus,
  WorkoutError,
  PostSetFlowState
} from './workout/types';
