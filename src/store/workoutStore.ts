
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TrainingConfig } from '@/hooks/useTrainingSetupPersistence';
import { toast } from "@/hooks/use-toast";
import React from 'react';

export interface ExerciseSet {
  weight: number;
  reps: number;
  restTime: number;
  completed: boolean;
  isEditing: boolean;
  rpe?: number; // Rate of Perceived Exertion (1-10 scale)
  metadata?: {
    autoAdjusted?: boolean;
    previousValues?: {
      weight?: number;
      reps?: number;
      restTime?: number;
    };
  };
}

export interface WorkoutExercises {
  [key: string]: ExerciseSet[];
}

export type WorkoutStatus = 
  | 'idle'        // Initial state
  | 'active'      // Workout in progress
  | 'saving'      // Saving in progress
  | 'saved'       // Successfully saved
  | 'failed'      // Save failed
  | 'partial'     // Partially saved
  | 'recovering'; // Attempting recovery

export interface WorkoutError {
  type: 'network' | 'database' | 'validation' | 'unknown';
  message: string;
  timestamp: string;
  recoverable: boolean;
}

// Extend with new interface for post-set flow
export type PostSetFlowState =
  | 'idle'        // No active post-set flow
  | 'rating'      // Showing RPE rating UI
  | 'resting'     // In rest period with enhanced timer
  | 'preparing';  // Preparing for next set

export interface WorkoutState {
  // Core workout data
  exercises: WorkoutExercises;
  activeExercise: string | null;
  elapsedTime: number;
  workoutId: string | null;
  startTime: string | null;
  workoutStatus: WorkoutStatus;
  
  // Configuration
  trainingConfig: TrainingConfig | null;
  
  // Focus state
  focusedExercise: string | null;
  focusedSetIndex: number | null;
  
  // Post-set feedback flow
  postSetFlow: PostSetFlowState;
  lastCompletedExercise: string | null;
  lastCompletedSetIndex: number | null;
  
  // Rest timer state
  restTimerActive: boolean;
  currentRestTime: number;
  
  // Session tracking
  isActive: boolean;
  lastActiveRoute: string;
  sessionId: string;
  explicitlyEnded: boolean;
  lastTabActivity: number;
  
  // Error handling
  savingErrors: WorkoutError[];
  
  // Action functions
  setExercises: (exercises: WorkoutExercises | ((prev: WorkoutExercises) => WorkoutExercises)) => void;
  setActiveExercise: (exerciseName: string | null) => void;
  setFocusedExercise: (exerciseName: string | null) => void;
  setFocusedSetIndex: (index: number | null) => void;
  setElapsedTime: (time: number | ((prev: number) => number)) => void;
  setRestTimerActive: (active: boolean) => void;
  setCurrentRestTime: (time: number) => void;
  setTrainingConfig: (config: TrainingConfig | null) => void;
  updateLastActiveRoute: (route: string) => void;
  setWorkoutStatus: (status: WorkoutStatus) => void;
  setPostSetFlow: (state: PostSetFlowState) => void;
  
  // Workout lifecycle actions
  startWorkout: () => void;
  endWorkout: () => void;
  resetSession: () => void;
  
  // Status management
  markAsSaving: () => void;
  markAsSaved: () => void;
  markAsFailed: (error: WorkoutError) => void;
  
  // Exercise management
  handleCompleteSet: (exerciseName: string, setIndex: number) => void;
  deleteExercise: (exerciseName: string) => void;
  
  // New post-set flow management
  startPostSetFlow: (exerciseName: string, setIndex: number) => void;
  submitSetRating: (rpe: number) => void;
  applySetRecommendation: (exerciseName: string, setIndex: number, weight: number, reps: number, restTime: number) => void;
}

// Generate a unique session ID
const generateSessionId = () => 
  crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`;

// Create the persistent store
export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      // Core workout data
      exercises: {},
      activeExercise: null,
      elapsedTime: 0,
      workoutId: null,
      startTime: null,
      workoutStatus: 'idle',
      
      // Configuration
      trainingConfig: null,
      
      // Focus state
      focusedExercise: null,
      focusedSetIndex: null,
      
      // Post-set feedback flow
      postSetFlow: 'idle',
      lastCompletedExercise: null,
      lastCompletedSetIndex: null,
      
      // Rest timer state
      restTimerActive: false,
      currentRestTime: 60,
      
      // Session tracking
      isActive: false,
      lastActiveRoute: '/training-session',
      sessionId: generateSessionId(),
      explicitlyEnded: false,
      lastTabActivity: Date.now(),
      
      // Error handling
      savingErrors: [],
      
      // Action setters
      setExercises: (exercises) => set((state) => ({ 
        exercises: typeof exercises === 'function' ? exercises(state.exercises) : exercises,
        lastTabActivity: Date.now(),
      })),
      
      setActiveExercise: (exerciseName) => set({ 
        activeExercise: exerciseName,
        lastTabActivity: Date.now(),
      }),
      
      setFocusedExercise: (exerciseName) => set({ 
        focusedExercise: exerciseName,
        focusedSetIndex: exerciseName ? 0 : null, // Reset set index when changing focus
        lastTabActivity: Date.now(),
      }),
      
      setFocusedSetIndex: (index) => set({ 
        focusedSetIndex: index,
        lastTabActivity: Date.now(),
      }),
      
      setElapsedTime: (time) => set((state) => ({ 
        elapsedTime: typeof time === 'function' ? time(state.elapsedTime) : time,
        lastTabActivity: Date.now(),
      })),
      
      setRestTimerActive: (active) => set({ 
        restTimerActive: active,
        lastTabActivity: Date.now(),
      }),
      
      setCurrentRestTime: (time) => set({ 
        currentRestTime: time,
        lastTabActivity: Date.now(),
      }),
      
      setTrainingConfig: (config) => set({ 
        trainingConfig: config,
        lastTabActivity: Date.now(),
      }),
      
      // Fixed: This function was causing infinite loops by updating on every call
      // Now we check if the route is actually different before updating state
      updateLastActiveRoute: (route) => set((state) => {
        // Only update if the route has actually changed
        if (state.lastActiveRoute !== route) {
          return { 
            lastActiveRoute: route,
            lastTabActivity: Date.now(),
          };
        }
        return {}; // Return empty object if no changes needed
      }),
      
      // New action to directly modify workout status
      setWorkoutStatus: (status) => set({ 
        workoutStatus: status,
        lastTabActivity: Date.now(),
      }),
      
      setPostSetFlow: (state) => set({
        postSetFlow: state,
        lastTabActivity: Date.now(),
      }),
      
      // Workout lifecycle actions
      startWorkout: () => {
        const now = new Date();
        set({ 
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
      },
      
      endWorkout: () => {
        set({ 
          isActive: false,
          explicitlyEnded: true,
          workoutStatus: 'idle',
          lastTabActivity: Date.now(),
        });
        console.log("Workout ended");
      },
      
      resetSession: () => {
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
        console.log("Workout session reset");
      },
      
      // Status management
      markAsSaving: () => set({ 
        workoutStatus: 'saving',
        lastTabActivity: Date.now(),
      }),
      
      markAsSaved: () => {
        set({ 
          workoutStatus: 'saved',
          isActive: false,
          explicitlyEnded: true,
          lastTabActivity: Date.now(),
        });
        
        // Show success notification
        toast.success("Workout saved successfully!");
        
        // Reset the session after a short delay
        setTimeout(() => {
          get().resetSession();
        }, 500);
      },
      
      markAsFailed: (error) => set((state) => ({ 
        workoutStatus: 'failed',
        savingErrors: [...state.savingErrors, error],
        lastTabActivity: Date.now(),
      })),
      
      // Exercise management
      handleCompleteSet: (exerciseName, setIndex) => set((state) => {
        const newExercises = { ...state.exercises };
        newExercises[exerciseName] = state.exercises[exerciseName].map((set, i) => 
          i === setIndex ? { ...set, completed: true } : set
        );
        
        // Start the post-set flow
        setTimeout(() => {
          const store = get();
          store.startPostSetFlow(exerciseName, setIndex);
        }, 10);
        
        return { 
          exercises: newExercises,
          // Don't immediately activate rest timer - we'll do that after rating
          lastTabActivity: Date.now(),
          lastCompletedExercise: exerciseName,
          lastCompletedSetIndex: setIndex,
        };
      }),
      
      deleteExercise: (exerciseName) => set((state) => {
        const newExercises = { ...state.exercises };
        delete newExercises[exerciseName];
        
        // Show notification
        toast.success(`Removed ${exerciseName} from workout`);
        
        // Clear focus if this was the focused exercise
        const newState: Partial<WorkoutState> = {
          exercises: newExercises,
          lastTabActivity: Date.now(),
        };
        
        if (state.focusedExercise === exerciseName) {
          newState.focusedExercise = null;
          newState.focusedSetIndex = null;
        }
        
        // Check if this was the last exercise, and if so, ask if user wants to end workout
        setTimeout(() => {
          const exerciseCount = Object.keys(newExercises).length;
          if (exerciseCount === 0) {
            toast.info("No exercises left. Add exercises or end your workout.", {
              action: {
                label: "End Workout",
                onClick: () => {
                  get().endWorkout();
                  toast.success("Workout ended");
                }
              }
            });
          }
        }, 500);
        
        return newState;
      }),
      
      // New functions for post-set flow
      startPostSetFlow: (exerciseName, setIndex) => set((state) => {
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
      }),
      
      submitSetRating: (rpe) => set((state) => {
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
            const { weight, reps, restTime } = newExercises[lastCompletedExercise][lastCompletedSetIndex];
            
            // Import recommendations dynamically to avoid circular dependencies
            import('@/utils/setRecommendations').then(({ getNextSetRecommendation }) => {
              const recommendation = getNextSetRecommendation(
                { weight, reps, restTime, completed: true, isEditing: false, rpe },
                rpe,
                lastCompletedExercise,
                []
              );
              
              // Apply the recommendation to the next set
              get().applySetRecommendation(
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
      }),
      
      applySetRecommendation: (exerciseName, setIndex, weight, reps, restTime) => set((state) => {
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
      }),
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these specific parts of the state
        exercises: state.exercises,
        activeExercise: state.activeExercise,
        elapsedTime: state.elapsedTime,
        workoutId: state.workoutId,
        startTime: state.startTime,
        workoutStatus: state.workoutStatus,
        trainingConfig: state.trainingConfig,
        isActive: state.isActive,
        lastActiveRoute: state.lastActiveRoute,
        sessionId: state.sessionId,
        explicitlyEnded: state.explicitlyEnded,
        focusedExercise: state.focusedExercise,
        focusedSetIndex: state.focusedSetIndex,
      }),
      onRehydrateStorage: () => {
        return (rehydratedState, error) => {
          if (error) {
            console.error('Error rehydrating workout state:', error);
            return;
          }
          
          if (rehydratedState && rehydratedState.isActive) {
            console.log('Rehydrated workout state:', rehydratedState);
            
            // Update elapsed time based on stored start time for active workouts
            if (rehydratedState.isActive && rehydratedState.startTime) {
              const storedStartTime = new Date(rehydratedState.startTime);
              const currentTime = new Date();
              const calculatedElapsedTime = Math.floor(
                (currentTime.getTime() - storedStartTime.getTime()) / 1000
              );
              
              // Only update if calculated time is greater than stored time
              if (calculatedElapsedTime > (rehydratedState.elapsedTime || 0)) {
                setTimeout(() => {
                  // Using the Zustand store's set function through the get() method
                  const store = useWorkoutStore.getState();
                  store.setElapsedTime(calculatedElapsedTime);
                  console.log(`Restored elapsed time: ${calculatedElapsedTime}s`);
                }, 100);
              }
              
              // Show recovery notification
              setTimeout(() => {
                toast.info("Workout session recovered");
              }, 1000);
            }
          }
        };
      }
    }
  )
);

// Create a hook for handling page visibility changes
export const useWorkoutPageVisibility = () => {
  const { isActive, setElapsedTime, startTime } = useWorkoutStore();
  
  React.useEffect(() => {
    if (!document || !isActive) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        // When tab becomes visible again, update elapsed time
        if (startTime) {
          const storedStartTime = new Date(startTime);
          const currentTime = new Date();
          const calculatedElapsedTime = Math.floor(
            (currentTime.getTime() - storedStartTime.getTime()) / 1000
          );
          
          setElapsedTime(calculatedElapsedTime);
          console.log(`Updated elapsed time after tab switch: ${calculatedElapsedTime}s`);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, setElapsedTime, startTime]);
};
