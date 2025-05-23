
import { generateSessionId } from './actions';
import { WorkoutStatus, WorkoutState, WorkoutError } from './types';
import { toast } from '@/hooks/use-toast';

/**
 * Workout Lifecycle Manager
 * Handles state transitions and lifecycle events for workouts
 */

// Define valid status transitions as a state machine
const validStatusTransitions: Record<WorkoutStatus, WorkoutStatus[]> = {
  'idle': ['active', 'recovering'],
  'active': ['saving', 'failed', 'idle'],
  'saving': ['saved', 'failed', 'partial'],
  'saved': ['idle'],
  'failed': ['saving', 'idle', 'recovering'],
  'partial': ['saving', 'recovering', 'idle'],
  'recovering': ['saved', 'failed', 'idle']
};

// Check if a status transition is valid
export const isValidStatusTransition = (
  currentStatus: WorkoutStatus, 
  newStatus: WorkoutStatus
): boolean => {
  return validStatusTransitions[currentStatus]?.includes(newStatus) || false;
};

// Start a new workout session
export const startWorkoutSession = (
  prevState: WorkoutState
): Partial<WorkoutState> => {
  const now = new Date();
  const sessionId = generateSessionId();
  
  console.log("Starting new workout session:", { 
    sessionId,
    startTime: now 
  });
  
  return {
    isActive: true,
    explicitlyEnded: false,
    workoutStatus: 'active',
    startTime: now.toISOString(),
    elapsedTime: 0,
    sessionId,
    workoutId: `temp-${sessionId}`, // Generate temporary ID until saved
    lastTabActivity: Date.now(),
  };
};

// End a workout session (without saving)
export const endWorkoutSession = (
  prevState: WorkoutState
): Partial<WorkoutState> => {
  console.log("Explicitly ending workout session, sessionId:", prevState.sessionId);
  
  return {
    isActive: false,
    explicitlyEnded: true,
    workoutStatus: 'idle',
    lastTabActivity: Date.now(),
  };
};

// Reset the workout session
export const resetWorkoutSession = (): Partial<WorkoutState> => {
  console.log("Resetting workout session completely");
  
  return {
    exercises: {},
    activeExercise: null,
    elapsedTime: 0,
    workoutId: null,
    startTime: null,
    workoutStatus: 'idle',
    trainingConfig: null,
    restTimerActive: false,
    currentRestTime: 60,
    isActive: false,
    explicitlyEnded: true,
    sessionId: generateSessionId(),
    lastTabActivity: Date.now(),
    savingErrors: [],
    focusedExercise: null,
    focusedSetIndex: null,
    postSetFlow: 'idle',
    lastCompletedExercise: null,
    lastCompletedSetIndex: null,
  };
};

// Mark the workout as transitioning to saving
export const transitionToSaving = (
  prevState: WorkoutState
): Partial<WorkoutState> => {
  if (!isValidStatusTransition(prevState.workoutStatus, 'saving')) {
    console.warn(`Invalid status transition: ${prevState.workoutStatus} -> saving`);
    toast({
      title: "Cannot save workout",
      description: `Current status (${prevState.workoutStatus}) doesn't allow saving`,
      variant: "destructive"
    });
    return {};
  }
  
  return {
    workoutStatus: 'saving',
    lastTabActivity: Date.now(),
  };
};

// Mark the workout as successfully saved
export const transitionToSaved = (
  prevState: WorkoutState
): Partial<WorkoutState> => {
  if (!isValidStatusTransition(prevState.workoutStatus, 'saved')) {
    console.warn(`Invalid status transition: ${prevState.workoutStatus} -> saved`);
    return {};
  }
  
  toast.success("Workout saved successfully!");
  
  return {
    workoutStatus: 'saved',
    isActive: false,
    explicitlyEnded: true,
    lastTabActivity: Date.now(),
  };
};

// Mark the workout as failed with an error
export const transitionToFailed = (
  prevState: WorkoutState,
  error: WorkoutError
): Partial<WorkoutState> => {
  if (!isValidStatusTransition(prevState.workoutStatus, 'failed')) {
    console.warn(`Invalid status transition: ${prevState.workoutStatus} -> failed`);
    return {};
  }
  
  return {
    workoutStatus: 'failed',
    savingErrors: [...(prevState.savingErrors || []), error],
    lastTabActivity: Date.now(),
  };
};

// Mark the workout as partially saved
export const transitionToPartial = (
  prevState: WorkoutState,
  error?: WorkoutError
): Partial<WorkoutState> => {
  if (!isValidStatusTransition(prevState.workoutStatus, 'partial')) {
    console.warn(`Invalid status transition: ${prevState.workoutStatus} -> partial`);
    return {};
  }
  
  const errors = error 
    ? [...(prevState.savingErrors || []), error] 
    : prevState.savingErrors;
  
  return {
    workoutStatus: 'partial',
    savingErrors: errors,
    lastTabActivity: Date.now(),
  };
};

// Mark the workout as recovering
export const transitionToRecovering = (
  prevState: WorkoutState
): Partial<WorkoutState> => {
  if (!isValidStatusTransition(prevState.workoutStatus, 'recovering')) {
    console.warn(`Invalid status transition: ${prevState.workoutStatus} -> recovering`);
    return {};
  }
  
  return {
    workoutStatus: 'recovering',
    lastTabActivity: Date.now(),
  };
};
