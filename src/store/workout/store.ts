
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
  
  // Enhanced workflow actions
  startWorkout: () => void;
  endWorkout: () => void;
  resetSession: () => void;
  detectAndCleanupZombieWorkout: () => boolean;
  runWorkoutValidation: () => void;
  
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

// Create the store with enhanced logic
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
      
      // Basic setters
      setExercises: (exercises) => {
        console.log('workout/store: setExercises called');
        
        if (typeof exercises === 'function') {
          const prevExercises = get().exercises;
          const newExercises = exercises(prevExercises);
          set({ 
            exercises: newExercises,
            lastTabActivity: Date.now(),
          });
        } else {
          set({ 
            exercises: exercises,
            lastTabActivity: Date.now(),
          });
        }
      },
      
      setActiveExercise: (exerciseName) => set({ 
        activeExercise: exerciseName,
        lastTabActivity: Date.now(),
      }),
      
      setFocusedExercise: (exerciseName) => set({ 
        focusedExercise: exerciseName,
        focusedSetIndex: exerciseName ? 0 : null,
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
      
      // Enhanced action functions with proper binding
      startWorkout: () => actions.startWorkout()(set, get),
      endWorkout: () => actions.endWorkout()(set, get),
      resetSession: () => actions.resetSession()(set, get),
      detectAndCleanupZombieWorkout: () => actions.detectAndCleanupZombieWorkout()(set, get),
      runWorkoutValidation: () => actions.runWorkoutValidation()(set, get),
      markAsSaving: () => actions.markAsSaving()(set, get),
      markAsSaved: () => actions.markAsSaved()(set, get),
      markAsFailed: (error) => actions.markAsFailed(error)(set, get),
      handleCompleteSet: (exerciseName, setIndex) => actions.handleCompleteSet(exerciseName, setIndex)(set, get),
      deleteExercise: (exerciseName) => actions.deleteExercise(exerciseName)(set, get),
      startPostSetFlow: (exerciseName, setIndex) => actions.startPostSetFlow(exerciseName, setIndex)(set, get),
      submitSetRating: (rpe) => actions.submitSetRating(rpe)(set, get),
      applySetRecommendation: (exerciseName, setIndex, weight, reps, restTime) => 
        actions.applySetRecommendation(exerciseName, setIndex, weight, reps, restTime)(set, get),
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
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
            
            // Auto-detect and cleanup zombie workouts on load
            setTimeout(() => {
              const store = getStore();
              store.getState().runWorkoutValidation();
            }, 100);
            
            // Update elapsed time for active workouts
            if (rehydratedState.isActive && rehydratedState.startTime && exerciseKeys.length > 0) {
              const storedStartTime = new Date(rehydratedState.startTime);
              const currentTime = new Date();
              const calculatedElapsedTime = Math.floor(
                (currentTime.getTime() - storedStartTime.getTime()) / 1000
              );
              
              if (calculatedElapsedTime > (rehydratedState.elapsedTime || 0)) {
                setTimeout(() => {
                  const store = getStore();
                  store.getState().setElapsedTime(calculatedElapsedTime);
                  console.log(`Restored elapsed time: ${calculatedElapsedTime}s`);
                }, 150);
              }
            }
          }
        };
      }
    }
  )
);

export const useWorkoutStore = () => getStore()();
