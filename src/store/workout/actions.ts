import { toast } from "@/hooks/use-toast";
import { WorkoutExercises, WorkoutError, WorkoutStatus } from "./types";
import { getStore } from "./store";

// Generate a unique session ID
export const generateSessionId = () => 
  crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`;

// Exercise management actions
export const handleCompleteSet = (exerciseName: string, setIndex: number) => {
  const store = getStore();
  
  store.setState(state => {
    const newExercises = { ...state.exercises };
    newExercises[exerciseName] = state.exercises[exerciseName].map((set, i) => 
      i === setIndex ? { ...set, completed: true } : set
    );
    
    // Start the post-set flow after a short delay
    setTimeout(() => {
      const store = getStore();
      store.getState().startPostSetFlow(exerciseName, setIndex);
    }, 10);
    
    return { 
      exercises: newExercises,
      lastTabActivity: Date.now(),
      lastCompletedExercise: exerciseName,
      lastCompletedSetIndex: setIndex,
    };
  });
};

export const deleteExercise = (exerciseName: string) => {
  const store = getStore();
  
  store.setState(state => {
    const newExercises = { ...state.exercises };
    delete newExercises[exerciseName];
    
    // Show notification
    toast.success(`Removed ${exerciseName} from workout`);
    
    // Clear focus if this was the focused exercise
    const newState: any = {
      exercises: newExercises,
      lastTabActivity: Date.now(),
    };
    
    if (state.focusedExercise === exerciseName) {
      newState.focusedExercise = null;
      newState.focusedSetIndex = null;
    }
    
    // Check if this was the last exercise
    setTimeout(() => {
      const exerciseCount = Object.keys(newExercises).length;
      if (exerciseCount === 0) {
        toast.info("No exercises left. Add exercises or end your workout.", {
          action: {
            label: "End Workout",
            onClick: () => {
              store.getState().endWorkout();
              toast.success("Workout ended");
            }
          }
        });
      }
    }, 500);
    
    return newState;
  });
};

// Workout lifecycle actions
export const startWorkout = () => {
  const now = new Date();
  const store = getStore();
  
  store.setState({ 
    isActive: true,
    explicitlyEnded: false,
    workoutStatus: 'active',
    startTime: now.toISOString(),
    elapsedTime: 0,
    sessionId: generateSessionId(),
    lastTabActivity: Date.now(),
  });
  
  // Show a toast notification
  toast.success("Workout started", {
    description: "Your workout session has begun"
  });
  
  console.log("Workout started at:", now);
};

export const endWorkout = () => {
  const store = getStore();
  
  store.setState({ 
    isActive: false,
    explicitlyEnded: true,
    workoutStatus: 'idle',
    lastTabActivity: Date.now(),
  });
  
  console.log("Workout ended");
};

export const resetSession = () => {
  const store = getStore();
  
  // First, log the current state to help with debugging
  const currentState = store.getState();
  console.log("Resetting workout session. Current state:", {
    exerciseCount: Object.keys(currentState.exercises).length,
    exercises: Object.keys(currentState.exercises),
    activeExercise: currentState.activeExercise,
    focusedExercise: currentState.focusedExercise,
    isActive: currentState.isActive,
    workoutStatus: currentState.workoutStatus
  });

  // Clear absolutely everything to prevent zombie states
  store.setState({ 
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
  
  console.log("Workout session reset complete");
  
  // Force clear localStorage directly as well to ensure a clean state
  try {
    localStorage.removeItem('workout-storage');
  } catch (e) {
    console.error("Failed to clear localStorage:", e);
  }
};

// Status management
export const markAsSaving = () => {
  getStore().setState({ 
    workoutStatus: 'saving' as WorkoutStatus,
    lastTabActivity: Date.now(),
  });
};

export const markAsSaved = () => {
  const store = getStore();
  
  store.setState({ 
    workoutStatus: 'saved' as WorkoutStatus,
    isActive: false,
    explicitlyEnded: true,
    lastTabActivity: Date.now(),
  });
  
  // Show success notification
  toast.success("Workout saved successfully!");
  
  // Reset the session after a short delay
  setTimeout(() => {
    resetSession();
  }, 500);
};

export const markAsFailed = (error: WorkoutError) => {
  getStore().setState((state) => ({ 
    workoutStatus: 'failed' as WorkoutStatus,
    savingErrors: [...(state.savingErrors || []), error],
    lastTabActivity: Date.now(),
  }));
};

// Post-set flow management
export const startPostSetFlow = (exerciseName: string, setIndex: number) => {
  getStore().setState(state => {
    if (!state.exercises[exerciseName] || setIndex >= state.exercises[exerciseName].length) {
      return {}; // Invalid exercise or set index
    }
    
    return {
      postSetFlow: 'rating',
      lastCompletedExercise: exerciseName,
      lastCompletedSetIndex: setIndex,
      focusedExercise: exerciseName,
      focusedSetIndex: setIndex,
      lastTabActivity: Date.now(),
    };
  });
};

export const submitSetRating = (rpe: number) => {
  const store = getStore();
  
  store.setState(state => {
    const { lastCompletedExercise, lastCompletedSetIndex } = state;
    
    if (!lastCompletedExercise || lastCompletedSetIndex === null) {
      return { postSetFlow: 'idle' }; // Reset if no context
    }
    
    const newExercises = { ...state.exercises };
    
    // Update the set with the RPE rating
    if (newExercises[lastCompletedExercise] && lastCompletedSetIndex < newExercises[lastCompletedExercise].length) {
      newExercises[lastCompletedExercise] = newExercises[lastCompletedExercise].map((set, i) => 
        i === lastCompletedSetIndex ? { ...set, rpe } : set
      );
      
      // Find the next set if it exists
      const nextSetIndex = lastCompletedSetIndex + 1;
      const hasNextSet = nextSetIndex < newExercises[lastCompletedExercise].length;
      
      // If there's a next set, try to adjust it based on the RPE
      if (hasNextSet) {
        const currentSet = newExercises[lastCompletedExercise][lastCompletedSetIndex];
        
        // Import recommendations dynamically to avoid circular dependencies
        import('@/utils/setRecommendations').then(({ getNextSetRecommendation }) => {
          const recommendation = getNextSetRecommendation(
            currentSet,
            rpe,
            lastCompletedExercise,
            []
          );
          
          // Apply the recommendation to the next set
          applySetRecommendation(
            lastCompletedExercise, 
            nextSetIndex,
            recommendation.weight,
            recommendation.reps,
            recommendation.restTime
          );
        });
      }
    }
    
    // Start rest timer
    return { 
      exercises: newExercises,
      postSetFlow: 'resting',
      restTimerActive: true,
      currentRestTime: newExercises[lastCompletedExercise]?.[lastCompletedSetIndex]?.restTime || 60,
      lastTabActivity: Date.now(),
    };
  });
};

export const applySetRecommendation = (
  exerciseName: string, 
  setIndex: number, 
  weight: number, 
  reps: number, 
  restTime: number
) => {
  getStore().setState(state => {
    if (!state.exercises[exerciseName] || setIndex >= state.exercises[exerciseName].length) {
      return {}; // Invalid exercise or set index
    }
    
    const newExercises = { ...state.exercises };
    const currentSet = newExercises[exerciseName][setIndex];
    
    // Only update if values are actually different
    if (currentSet.weight !== weight || currentSet.reps !== reps || currentSet.restTime !== restTime) {
      // Store previous values for reference
      const previousValues = {
        weight: currentSet.weight,
        reps: currentSet.reps,
        restTime: currentSet.restTime
      };
      
      // Update the set with new values and mark as auto-adjusted
      newExercises[exerciseName][setIndex] = {
        ...currentSet,
        weight,
        reps,
        restTime,
        metadata: {
          ...currentSet.metadata,
          autoAdjusted: true,
          previousValues
        }
      };
      
      return { 
        exercises: newExercises,
        lastTabActivity: Date.now(),
      };
    }
    
    return {}; // No changes needed
  });
};

// New function to detect and repair inconsistent state
export const validateWorkoutState = () => {
  const store = getStore();
  const state = store.getState();
  const exerciseKeys = Object.keys(state.exercises);
  const exerciseCount = exerciseKeys.length;
  
  console.log("Validating workout state:", {
    exerciseKeys,
    exerciseCount,
    isActive: state.isActive
  });
  
  // Check for zombie state: workout active but no exercises
  if (state.isActive && exerciseCount === 0) {
    console.log("Detected zombie state: workout active but no exercises");
    toast.error("Workout data inconsistency detected. Resetting session.", {
      description: "The workout appeared to be active but contained no exercises."
    });
    resetSession();
    return false;
  }
  
  // Check for invalid exercises (empty objects)
  const hasInvalidExercises = exerciseKeys.some(key => {
    const sets = state.exercises[key];
    return !sets || !Array.isArray(sets) || sets.length === 0;
  });
  
  if (hasInvalidExercises) {
    console.log("Detected invalid exercises with no sets");
    // Clean up the invalid exercises
    const validExercises = { ...state.exercises };
    let hasChanged = false;
    
    exerciseKeys.forEach(key => {
      const sets = validExercises[key];
      if (!sets || !Array.isArray(sets) || sets.length === 0) {
        delete validExercises[key];
        hasChanged = true;
      }
    });
    
    if (hasChanged) {
      toast.warning("Some exercises were invalid and have been removed.", {
        description: "Your workout has been repaired."
      });
      
      store.setState({ 
        exercises: validExercises,
        lastTabActivity: Date.now(),
      });
      
      // If no exercises left after cleanup, reset the session
      if (Object.keys(validExercises).length === 0 && state.isActive) {
        console.log("No valid exercises left after cleanup, resetting session");
        resetSession();
        return false;
      }
    }
  }
  
  return true;
}
