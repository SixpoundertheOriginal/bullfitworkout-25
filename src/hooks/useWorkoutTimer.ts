
// This file is maintained for backward compatibility
// The functionality has been moved to src/store/workout/hooks.ts

import { useWorkoutTimer as useWorkoutTimerNew } from '../store/workout';

export function useWorkoutTimer() {
  return useWorkoutTimerNew();
}
