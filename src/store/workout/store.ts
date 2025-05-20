
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TrainingConfig } from '@/hooks/useTrainingSetupPersistence';
import { WorkoutExercises, WorkoutError, WorkoutStatus, PostSetFlowState } from './types';
import * as actions from './actions';

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
  
  // Post-set flow management
  startPostSetFlow: (exerciseName: string, setIndex: number) => void;
  submitSetRating: (rpe: number) => void;
  applySetRecommendation: (exerciseName: string, setIndex: number, weight: number, reps: number, restTime: number) => void;
}

// Create a global variable to track if storage was already initialized
let store: ReturnType<typeof createStore> | null = null;

// Helper function to access the store
export const getStore = () => {
  if (!store) {
    console.log('workout/store: Creating new store instance');
    store = createStore();
  }
  return store;
}

// Helper function to validate workout data structure
const validateExercises = (exercises: WorkoutExercises): WorkoutExercises => {
  if (!exercises || typeof exercises !== 'object') {
    console.warn('workout/store: Invalid exercises data structure, resetting');
    return {};
  }
  
  const validExercises: WorkoutExercises = {};
  let hasInvalidData = false;
  
  Object.keys(exercises).forEach(key => {
    const sets = exercises[key];
    // Check if sets exists and is an array with at least one item
    if (sets && Array.isArray(sets) && sets.length > 0) {
      validExercises[key] = sets;
    } else {
      hasInvalidData = true;
      console.warn(`workout/store: Invalid sets for exercise "${key}"`);
    }
  });
  
  if (hasInvalidData) {
    console.warn('workout/store: Some exercises were invalid and have been filtered out');
  }
  
  return validExercises;
}

// Create the store with all the logic
const createStore = () => create<WorkoutState>()(
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
      sessionId: actions.generateSessionId(),
      explicitlyEnded: false,
      lastTabActivity: Date.now(),
      
      // Error handling
      savingErrors: [],
      
      // Action setters with enhanced logging
      setExercises: (exercises) => {
        console.log('workout/store: setExercises called');
        console.log('workout/store: Type of exercises param:', typeof exercises);
        
        if (typeof exercises === 'function') {
          console.log('workout/store: Using exercise updater function');
          const prevExercises = get().exercises;
          console.log('workout/store: Previous exercises:', Object.keys(prevExercises));
          const newExercises = exercises(prevExercises);
          console.log('workout/store: New exercises after function:', Object.keys(newExercises));
          
          set({ 
            exercises: newExercises,
            lastTabActivity: Date.now(),
          });
        } else {
          console.log('workout/store: Using direct exercise object');
          console.log('workout/store: New exercises direct:', Object.keys(exercises));
          
          set({ 
            exercises: exercises,
            lastTabActivity: Date.now(),
          });
        }
        
        // Log the result after update
        setTimeout(() => {
          console.log('workout/store: Exercises after update (timeout check):', 
            Object.keys(get().exercises));
        }, 100);
      },
      
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
      
      // Only update if the route has actually changed to prevent loops
      updateLastActiveRoute: (route) => set((state) => {
        if (state.lastActiveRoute !== route) {
          return { 
            lastActiveRoute: route,
            lastTabActivity: Date.now(),
          };
        }
        return {};
      }),
      
      setWorkoutStatus: (status) => set({ 
        workoutStatus: status,
        lastTabActivity: Date.now(),
      }),
      
      setPostSetFlow: (state) => set({
        postSetFlow: state,
        lastTabActivity: Date.now(),
      }),
      
      // Connect the core action functions
      startWorkout: actions.startWorkout,
      endWorkout: actions.endWorkout,
      resetSession: actions.resetSession,
      markAsSaving: actions.markAsSaving,
      markAsSaved: actions.markAsSaved,
      markAsFailed: actions.markAsFailed,
      handleCompleteSet: actions.handleCompleteSet,
      deleteExercise: actions.deleteExercise,
      startPostSetFlow: actions.startPostSetFlow,
      submitSetRating: actions.submitSetRating,
      applySetRecommendation: actions.applySetRecommendation,
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these specific parts of the state
        exercises: validateExercises(state.exercises),
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
          
          if (rehydratedState) {
            console.log('Rehydrated workout state:', {
              hasExercises: rehydratedState.exercises ? Object.keys(rehydratedState.exercises).length > 0 : false,
              exerciseCount: rehydratedState.exercises ? Object.keys(rehydratedState.exercises).length : 0,
              isActive: rehydratedState.isActive,
              workoutStatus: rehydratedState.workoutStatus,
            });
            
            // Validate exercises after rehydration
            const validatedExercises = validateExercises(rehydratedState.exercises || {});
            const exerciseKeys = Object.keys(validatedExercises);
            
            // Detect zombie state: workout active but no exercises
            if (rehydratedState.isActive && exerciseKeys.length === 0) {
              console.warn('Detected zombie workout state - active but no exercises');
              
              // Reset the workout in the next event loop
              setTimeout(() => {
                actions.resetSession();
              }, 100);
              
              return;
            }
            
            // If activeExercise is set but doesn't exist in exercises, clear it
            if (rehydratedState.activeExercise && !exerciseKeys.includes(rehydratedState.activeExercise)) {
              console.warn('Active exercise does not exist in loaded exercises, clearing');
              
              setTimeout(() => {
                const store = getStore();
                store.setState({ activeExercise: null });
              }, 100);
            }
            
            // If focusedExercise is set but doesn't exist in exercises, clear it
            if (rehydratedState.focusedExercise && !exerciseKeys.includes(rehydratedState.focusedExercise)) {
              console.warn('Focused exercise does not exist in loaded exercises, clearing');
              
              setTimeout(() => {
                const store = getStore();
                store.setState({ focusedExercise: null });
              }, 100);
            }
            
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
                  const store = getStore();
                  store.getState().setElapsedTime(calculatedElapsedTime);
                  console.log(`Restored elapsed time: ${calculatedElapsedTime}s`);
                }, 100);
              }
            }
          }
        };
      }
    }
  )
);

export const useWorkoutStore = () => getStore()();
