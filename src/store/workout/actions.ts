
import { toast } from "@/hooks/use-toast";
import { WorkoutExercises, WorkoutError, WorkoutStatus, ExerciseSet } from "./types";
import { getStore } from "./store";
import { 
  validateWorkoutState as validateState, 
  isZombieWorkout, 
  repairExercises 
} from "./validators";
import {
  startWorkoutSession,
  endWorkoutSession,
  resetWorkoutSession,
  transitionToSaving,
  transitionToSaved,
  transitionToFailed,
  transitionToPartial,
  transitionToRecovering
} from "./lifecycle";

// Generate a unique session ID
export const generateSessionId = () =>
  crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`;

// Create a default set - making this function public so it can be used in other functions
export const createDefaultSet = (exerciseName: string, setNumber: number = 1): ExerciseSet => ({
  id: `temp-${exerciseName}-${setNumber}-${Date.now()}`,
  workout_id: 'temp',
  exercise_name: exerciseName,
  weight: 0,
  reps: 10,
  restTime: 60,
  completed: false,
  set_number: setNumber,
  isEditing: false,
  metadata: {
    autoAdjusted: true, 
    exerciseName,
    createdAt: new Date().toISOString()
  }
});

// Exercise management actions
export const handleCompleteSet = (exerciseName: string, setIndex: number) => {
  const store = getStore();

  store.setState(state => {
    const newExercises = { ...state.exercises };
    newExercises[exerciseName] = state.exercises[exerciseName].map((set, i) =>
      i === setIndex ? { ...set, completed: true } : set
    );

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

    toast.success(`Removed ${exerciseName} from workout`);

    const newState: any = {
      exercises: newExercises,
      lastTabActivity: Date.now(),
    };

    if (state.focusedExercise === exerciseName) {
      newState.focusedExercise = null;
      newState.focusedSetIndex = null;
    }

    if (state.activeExercise === exerciseName) {
      newState.activeExercise = null;
    }

    setTimeout(() => {
      const exerciseCount = Object.keys(newExercises).length;
      if (exerciseCount === 0) {
        toast.info("No exercises left. Add exercises or end your workout.", {
          action: {
            label: "End Workout",
            onClick: () => {
              store.getState().endWorkout();
              toast.success("Workout ended");
            },
          },
        });
      }
    }, 500);

    // Run validation after exercise deletion
    setTimeout(() => runWorkoutValidation(), 100);

    return newState;
  });
};

// Workout lifecycle actions
export const startWorkout = () => {
  const store = getStore();
  const currentState = store.getState();
  
  store.setState(startWorkoutSession(currentState));

  toast.success("Workout started", {
    description: "Your workout session has begun",
  });

  console.log("Workout started with session ID:", store.getState().sessionId);
};

export const endWorkout = () => {
  const store = getStore();
  const currentState = store.getState();
  
  store.setState(endWorkoutSession(currentState));

  console.log("Workout ended");
};

export const resetSession = () => {
  const store = getStore();

  const currentState = store.getState();
  console.log("Resetting workout session. Current state:", {
    exerciseCount: Object.keys(currentState.exercises).length,
    exercises: Object.keys(currentState.exercises),
    activeExercise: currentState.activeExercise,
    focusedExercise: currentState.focusedExercise,
    isActive: currentState.isActive,
    workoutStatus: currentState.workoutStatus,
  });

  // Clear all state completely to avoid any lingering issues
  store.setState(resetWorkoutSession());

  try {
    // Clear localStorage to ensure complete cleanup
    localStorage.removeItem("workout-storage");
    console.log("Workout storage cleared from localStorage");
    
    // Some browsers may need a delay to ensure state is consistent
    setTimeout(() => {
      // Verify the reset was successful
      const postResetState = store.getState();
      console.log("Post-reset check - workout is active?", postResetState.isActive);
      console.log("Post-reset check - exercise count:", Object.keys(postResetState.exercises || {}).length);
      
      if (postResetState.isActive || Object.keys(postResetState.exercises || {}).length > 0) {
        console.warn("Reset may not have fully cleared state, forcing reload");
        // Last resort - hard reload the page if state persists
        window.location.reload();
      }
    }, 100);
  } catch (e) {
    console.error("Failed to clear localStorage:", e);
  }
};

// Status management
export const markAsSaving = () => {
  const store = getStore();
  const state = store.getState();
  
  store.setState(transitionToSaving(state));
};

export const markAsSaved = () => {
  const store = getStore();
  const state = store.getState();

  store.setState(transitionToSaved(state));

  // Schedule resetSession to run after state updates
  setTimeout(() => {
    resetSession();
  }, 500);
};

export const markAsFailed = (error: WorkoutError) => {
  const store = getStore();
  const state = store.getState();
  
  store.setState(transitionToFailed(state, error));
};

export const startPostSetFlow = (exerciseName: string, setIndex: number) => {
  getStore().setState(state => {
    if (!state.exercises[exerciseName] || setIndex >= state.exercises[exerciseName].length) {
      return {};
    }

    return {
      postSetFlow: "rating",
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
      return { postSetFlow: "idle" };
    }

    const newExercises = { ...state.exercises };

    if (newExercises[lastCompletedExercise] && lastCompletedSetIndex < newExercises[lastCompletedExercise].length) {
      newExercises[lastCompletedExercise] = newExercises[lastCompletedExercise].map((set, i) =>
        i === lastCompletedSetIndex ? { ...set, rpe } : set
      );

      const nextSetIndex = lastCompletedSetIndex + 1;
      const hasNextSet = nextSetIndex < newExercises[lastCompletedExercise].length;

      if (hasNextSet) {
        const currentSet = newExercises[lastCompletedExercise][lastCompletedSetIndex];

        import("@/utils/setRecommendations").then(({ getNextSetRecommendation }) => {
          const recommendation = getNextSetRecommendation(
            currentSet,
            rpe,
            lastCompletedExercise,
            []
          );

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

    return {
      exercises: newExercises,
      postSetFlow: "resting",
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
      return {};
    }

    const newExercises = { ...state.exercises };
    const currentSet = newExercises[exerciseName][setIndex];

    if (
      currentSet.weight !== weight ||
      currentSet.reps !== reps ||
      currentSet.restTime !== restTime
    ) {
      const previousValues = {
        weight: currentSet.weight,
        reps: currentSet.reps,
        restTime: currentSet.restTime,
      };

      newExercises[exerciseName][setIndex] = {
        ...currentSet,
        weight,
        reps,
        restTime,
        metadata: {
          ...currentSet.metadata,
          autoAdjusted: true,
          previousValues,
        },
      };

      return {
        exercises: newExercises,
        lastTabActivity: Date.now(),
      };
    }

    return {};
  });
};

// Centralized validation function - renamed to avoid conflict
export const runWorkoutValidation = () => {
  const store = getStore();
  const state = store.getState();
  
  // Run comprehensive validation with repair capability
  const validationResult = validateState(state, { 
    showToasts: true,
    attemptRepair: true
  });
  
  console.log("Workout validation result:", validationResult);
  
  if (validationResult.isValid) {
    return true;
  }
  
  // Perform repairs if needed
  if (validationResult.needsRepair) {
    if (isZombieWorkout(state)) {
      console.warn("Detected zombie workout - resetting session");
      resetSession();
      return false;
    }
    
    // Attempt to repair exercise data
    const repairedExercises = repairExercises(state.exercises);
    store.setState({
      exercises: repairedExercises,
      lastTabActivity: Date.now(),
    });
    
    const exerciseCountAfterRepair = Object.keys(repairedExercises).length;
    if (exerciseCountAfterRepair === 0 && state.isActive) {
      console.warn("No valid exercises after repair, resetting session");
      resetSession();
      return false;
    }
    
    if (exerciseCountAfterRepair > 0) {
      toast({
        title: "Workout data repaired",
        description: `Fixed issues with ${Object.keys(state.exercises).length - exerciseCountAfterRepair} exercises`,
      });
    }
  }
  
  return validationResult.isValid;
};
