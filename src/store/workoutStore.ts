
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

// Re-export types
export type {
  WorkoutState,
} from './workout/store';

export type {
  ExerciseSet,
  WorkoutExercises,
  WorkoutStatus,
  WorkoutError,
  PostSetFlowState
} from './workout/types';
