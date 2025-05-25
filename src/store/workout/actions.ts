
import { WorkoutState, WorkoutExercises, WorkoutError } from './types';
import { toast } from '@/hooks/use-toast';

// Generate a unique session ID
export const generateSessionId = (): string => {
  return crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Create a default set for an exercise
export const createDefaultSet = (exerciseName: string, setNumber: number) => {
  return {
    id: `temp-${exerciseName}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    exercise_name: exerciseName,
    weight: 0,
    reps: 10,
    restTime: 60,
    completed: false,
    set_number: setNumber,
    isEditing: false
  };
};

// Enhanced validation before starting workout
export const canStartWorkout = (state: WorkoutState): boolean => {
  // Can't start if already active
  if (state.isActive) {
    console.warn('Cannot start workout: Already active');
    return false;
  }
  
  // Can't start if explicitly ended
  if (state.explicitlyEnded) {
    console.warn('Cannot start workout: Session explicitly ended');
    return false;
  }
  
  // Can't start if in saving state
  if (state.workoutStatus === 'saving') {
    console.warn('Cannot start workout: Currently saving');
    return false;
  }
  
  return true;
};

// Enhanced start workout with validation
export const startWorkout = () => (set: any, get: any) => {
  const currentState = get();
  
  // Validate we can start
  if (!canStartWorkout(currentState)) {
    toast({
      title: "Cannot start workout",
      description: "Please complete or reset your current session first",
      variant: "destructive"
    });
    return;
  }
  
  const now = new Date();
  const sessionId = generateSessionId();
  
  console.log('🚀 Starting new workout session:', { sessionId, timestamp: now });
  
  set({
    isActive: true,
    explicitlyEnded: false,
    workoutStatus: 'active',
    startTime: now.toISOString(),
    elapsedTime: 0,
    sessionId,
    workoutId: `workout-${sessionId}`,
    lastTabActivity: Date.now(),
    savingErrors: [], // Clear any previous errors
  });
};

// Enhanced end workout
export const endWorkout = () => (set: any, get: any) => {
  const currentState = get();
  
  console.log('🏁 Ending workout session:', { 
    sessionId: currentState.sessionId,
    wasActive: currentState.isActive 
  });
  
  set({
    isActive: false,
    explicitlyEnded: true,
    workoutStatus: 'idle',
    lastTabActivity: Date.now(),
  });
};

// Enhanced reset with zombie cleanup
export const resetSession = () => (set: any, get: any) => {
  const currentState = get();
  
  console.log('🔄 Resetting workout session:', { 
    sessionId: currentState.sessionId,
    hadExercises: Object.keys(currentState.exercises || {}).length > 0,
    wasActive: currentState.isActive
  });
  
  // Clear everything and start fresh
  set({
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
  });
  
  // Clear localStorage to prevent zombie state persistence
  try {
    localStorage.removeItem('workout-storage');
    console.log('✅ Cleared workout storage');
  } catch (error) {
    console.error('❌ Failed to clear workout storage:', error);
  }
};

// Zombie workout detection and cleanup
export const detectAndCleanupZombieWorkout = () => (set: any, get: any) => {
  const state = get();
  
  // Check for zombie workout: active but no exercises
  if (state.isActive && (!state.exercises || Object.keys(state.exercises).length === 0)) {
    console.warn('🧟‍♂️ Zombie workout detected - active but no exercises');
    
    // Reset the zombie workout
    resetSession()(set, get);
    
    toast({
      title: "Workout Reset",
      description: "Detected and cleared an invalid workout state",
      variant: "destructive"
    });
    
    return true; // Zombie was detected and cleaned
  }
  
  // Check for other zombie conditions
  if (state.workoutStatus === 'saved' && state.isActive) {
    console.warn('🧟‍♂️ Zombie workout detected - saved but still active');
    resetSession()(set, get);
    return true;
  }
  
  if (state.explicitlyEnded && state.isActive) {
    console.warn('🧟‍♂️ Zombie workout detected - ended but still active');
    resetSession()(set, get);
    return true;
  }
  
  return false; // No zombie detected
};

// Comprehensive workout validation
export const runWorkoutValidation = () => (set: any, get: any) => {
  const state = get();
  
  console.log('🔍 Running workout validation:', {
    isActive: state.isActive,
    exerciseCount: Object.keys(state.exercises || {}).length,
    workoutStatus: state.workoutStatus,
    sessionId: state.sessionId
  });
  
  // First check for and cleanup zombie workouts
  const zombieDetected = detectAndCleanupZombieWorkout()(set, get);
  
  if (zombieDetected) {
    console.log('✅ Zombie workout cleaned up');
    return;
  }
  
  console.log('✅ Workout validation passed');
};

// Status management functions
export const markAsSaving = () => (set: any) => {
  set({
    workoutStatus: 'saving',
    lastTabActivity: Date.now(),
  });
};

export const markAsSaved = () => (set: any) => {
  set({
    workoutStatus: 'saved',
    isActive: false,
    explicitlyEnded: true,
    lastTabActivity: Date.now(),
  });
  
  toast({
    title: "Workout Saved",
    description: "Your workout has been saved successfully",
  });
};

export const markAsFailed = (error: WorkoutError) => (set: any, get: any) => {
  const currentErrors = get().savingErrors || [];
  
  set({
    workoutStatus: 'failed',
    savingErrors: [...currentErrors, error],
    lastTabActivity: Date.now(),
  });
};

export const handleCompleteSet = (exerciseName: string, setIndex: number) => (set: any, get: any) => {
  const currentExercises = get().exercises;
  
  if (!currentExercises[exerciseName] || !currentExercises[exerciseName][setIndex]) {
    console.error('Cannot complete set: Exercise or set not found');
    return;
  }
  
  const updatedExercises = {
    ...currentExercises,
    [exerciseName]: currentExercises[exerciseName].map((set, i) => 
      i === setIndex ? { ...set, completed: true } : set
    )
  };
  
  set({
    exercises: updatedExercises,
    lastCompletedExercise: exerciseName,
    lastCompletedSetIndex: setIndex,
    lastTabActivity: Date.now(),
  });
};

export const deleteExercise = (exerciseName: string) => (set: any, get: any) => {
  const currentExercises = get().exercises;
  const { [exerciseName]: deleted, ...remainingExercises } = currentExercises;
  
  set({
    exercises: remainingExercises,
    activeExercise: get().activeExercise === exerciseName ? null : get().activeExercise,
    focusedExercise: get().focusedExercise === exerciseName ? null : get().focusedExercise,
    lastTabActivity: Date.now(),
  });
  
  toast({
    title: "Exercise Removed",
    description: `Removed ${exerciseName} from workout`,
  });
};

export const startPostSetFlow = (exerciseName: string, setIndex: number) => (set: any) => {
  set({
    postSetFlow: 'rating',
    lastCompletedExercise: exerciseName,
    lastCompletedSetIndex: setIndex,
    lastTabActivity: Date.now(),
  });
};

export const submitSetRating = (rpe: number) => (set: any) => {
  set({
    postSetFlow: 'recommendation',
    lastTabActivity: Date.now(),
  });
};

export const applySetRecommendation = (exerciseName: string, setIndex: number, weight: number, reps: number, restTime: number) => (set: any, get: any) => {
  const currentExercises = get().exercises;
  
  if (!currentExercises[exerciseName]) {
    console.error('Cannot apply recommendation: Exercise not found');
    return;
  }
  
  // Add a new set with the recommended values
  const updatedExercises = {
    ...currentExercises,
    [exerciseName]: [
      ...currentExercises[exerciseName],
      {
        id: `temp-${exerciseName}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        exercise_name: exerciseName,
        weight,
        reps,
        restTime,
        completed: false,
        set_number: currentExercises[exerciseName].length,
        isEditing: false
      }
    ]
  };
  
  set({
    exercises: updatedExercises,
    postSetFlow: 'idle',
    currentRestTime: restTime,
    lastTabActivity: Date.now(),
  });
};
