import { toast } from "@/hooks/use-toast";
import { WorkoutExercises, WorkoutError, WorkoutStatus, ExerciseSet } from "./types";
import { getStore } from "./store";

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
    autoAdjusted: true, // Changed from autoCreated to autoAdjusted to match the type
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

    setTimeout(() => validateWorkoutState(), 100);

    return newState;
  });
};

// Workout lifecycle actions
export const startWorkout = () => {
  const now = new Date();
  const store = getStore();

  // Generate a temporary workoutId to ensure it's never null
  const tempWorkoutId = `temp-${Date.now()}`;

  store.setState({
    isActive: true,
    explicitlyEnded: false,
    workoutStatus: "active",
    startTime: now.toISOString(),
    elapsedTime: 0,
    sessionId: generateSessionId(),
    workoutId: tempWorkoutId, // Ensure workoutId is always set
    lastTabActivity: Date.now(),
  });

  toast.success("Workout started", {
    description: "Your workout session has begun",
  });

  console.log("Workout started at:", now, "with temporary ID:", tempWorkoutId);
};

export const endWorkout = () => {
  const store = getStore();

  store.setState({
    isActive: false,
    explicitlyEnded: true,
    workoutStatus: "idle",
    lastTabActivity: Date.now(),
  });

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

  store.setState({
    exercises: {},
    activeExercise: null,
    elapsedTime: 0,
    workoutId: null,
    startTime: null,
    workoutStatus: "idle",
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
    postSetFlow: "idle",
    lastCompletedExercise: null,
    lastCompletedSetIndex: null,
  });

  try {
    localStorage.removeItem("workout-storage");
    console.log("Workout storage cleared from localStorage");
  } catch (e) {
    console.error("Failed to clear localStorage:", e);
  }
};

// Status management
export const markAsSaving = () => {
  getStore().setState({
    workoutStatus: "saving" as WorkoutStatus,
    lastTabActivity: Date.now(),
  });
};

export const markAsSaved = () => {
  const store = getStore();

  store.setState({
    workoutStatus: "saved" as WorkoutStatus,
    isActive: false,
    explicitlyEnded: true,
    lastTabActivity: Date.now(),
  });

  toast.success("Workout saved successfully!");

  setTimeout(() => {
    resetSession();
  }, 500);
};

export const markAsFailed = (error: WorkoutError) => {
  getStore().setState(state => ({
    workoutStatus: "failed" as WorkoutStatus,
    savingErrors: [...(state.savingErrors || []), error],
    lastTabActivity: Date.now(),
  }));
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

export const validateWorkoutState = () => {
  const store = getStore();
  const state = store.getState();
  const exerciseKeys = Object.keys(state.exercises);
  const exerciseCount = exerciseKeys.length;

  console.log("Validating workout state:", {
    exerciseKeys,
    exerciseCount,
    isActive: state.isActive,
    workoutId: state.workoutId || "not set"
  });

  if (state.isActive && exerciseCount === 0) {
    console.log("Detected zombie state: workout active but no exercises");
    toast.error("Workout data inconsistency detected. Resetting session.", {
      description: "The workout appeared to be active but contained no exercises.",
    });
    resetSession();
    return false;
  }

  let repaired = 0;
  let hasChanged = false;
  const validExercises = { ...state.exercises };

  for (const key of exerciseKeys) {
    const sets = validExercises[key];
    
    // First check if sets array exists and is valid
    if (!Array.isArray(sets) || sets.length === 0) {
      console.warn(`Exercise "${key}" has empty or invalid sets array. Repairing with default sets.`);
      validExercises[key] = [
        createDefaultSet(key, 1),
        createDefaultSet(key, 2),
        createDefaultSet(key, 3)
      ];
      repaired++;
      hasChanged = true;
      continue;
    }
    
    // Check each set for validity with more detailed logging
    const isValid = sets.every(set => {
      const validity = (
        typeof set === 'object' &&
        set !== null &&
        typeof set.reps === "number" &&
        set.reps >= 1 &&
        typeof set.restTime === "number" &&
        typeof set.set_number === "number"
      );
      
      if (!validity) {
        console.warn(`Invalid set found in "${key}":`, set);
      }
      
      return validity;
    });

    if (!isValid) {
      console.warn(`Invalid sets found for exercise: ${key}. Attempting auto-repair.`, sets);
      validExercises[key] = [
        createDefaultSet(key, 1),
        createDefaultSet(key, 2),
        createDefaultSet(key, 3)
      ];
      repaired++;
      hasChanged = true;
    }
  }

  if (repaired > 0) {
    toast.success(`Workout repaired`, {
      description: `${repaired} exercise(s) were fixed with default sets.`
    });

    store.setState({
      exercises: validExercises,
      lastTabActivity: Date.now(),
    });
  }

  if (Object.keys(validExercises).length === 0 && state.isActive) {
    console.log("No valid exercises left after repair attempts, resetting session");
    resetSession();
    return false;
  }

  return !hasChanged;
};
