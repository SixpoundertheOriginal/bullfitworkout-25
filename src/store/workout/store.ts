import { create } from 'zustand';
import { persist, subscriptWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { WorkoutState, WorkoutExercises, ExerciseSet, WorkoutStatus, PostSetFlowState } from './types';
import { validateWorkoutState, isZombieWorkout, repairExercises } from './validators';
import { toast } from '@/hooks/use-toast';

interface WorkoutStore extends WorkoutState {
  setExercises: (exercises: WorkoutExercises | ((prev: WorkoutExercises) => WorkoutExercises)) => void;
  addExercise: (exerciseName: string) => void;
  deleteExercise: (exerciseName: string) => void;
  updateLastActiveRoute: (route: string) => void;
  setActiveExercise: (exerciseName: string | null) => void;
  setFocusedExercise: (exerciseName: string | null) => void;
  handleCompleteSet: (exerciseName: string, setIndex: number, rpe?: number) => void;
  submitSetRating: (rpe: number) => void;
  triggerRestTimerReset: () => void;
  setRestTimerActive: (active: boolean) => void;
  setPostSetFlow: (flow: PostSetFlowState) => void;
  startWorkout: () => void;
  resetSession: () => void;
  setWorkoutStatus: (status: WorkoutStatus) => void;
  setTrainingConfig: (config: any) => void;
  runWorkoutValidation: () => void;
  detectAndCleanupZombieWorkout: () => boolean;
}

const createInitialState = (): WorkoutState => ({
  exercises: {},
  activeExercise: null,
  focusedExercise: null,
  elapsedTime: 0,
  isActive: false,
  workoutStatus: 'idle',
  restTimerActive: false,
  restTimerResetSignal: 0,
  currentRestTime: 0,
  workoutId: null,
  sessionId: null,
  isRecoveryMode: false,
  explicitlyEnded: false,
  savingErrors: [],
  lastActiveRoute: null,
  lastTabActivity: Date.now(),
  postSetFlow: 'none',
  lastCompletedExercise: null,
  lastCompletedSetIndex: null,
  trainingConfig: null,
  startTime: null, // NEW: Track when workout was started
});

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    immer((set, get) => ({
      ...createInitialState(),

      setExercises: (exercises) => {
        set((state) => {
          if (typeof exercises === 'function') {
            state.exercises = exercises(state.exercises);
          } else {
            state.exercises = exercises;
          }
          state.lastTabActivity = Date.now();
        });
      },

      addExercise: (exerciseName) => {
        set((state) => {
          if (!state.exercises[exerciseName]) {
            state.exercises[exerciseName] = [];
            state.lastTabActivity = Date.now();
          }
        });
      },

      deleteExercise: (exerciseName) => {
        set((state) => {
          delete state.exercises[exerciseName];
          if (state.activeExercise === exerciseName) {
            state.activeExercise = null;
          }
          if (state.focusedExercise === exerciseName) {
            state.focusedExercise = null;
          }
          state.lastTabActivity = Date.now();
        });
      },

      updateLastActiveRoute: (route) => {
        set((state) => {
          state.lastActiveRoute = route;
          state.lastTabActivity = Date.now();
        });
      },

      setActiveExercise: (exerciseName) => {
        set((state) => {
          state.activeExercise = exerciseName;
          state.lastTabActivity = Date.now();
        });
      },

      setFocusedExercise: (exerciseName) => {
        set((state) => {
          state.focusedExercise = exerciseName;
          state.lastTabActivity = Date.now();
        });
      },

      handleCompleteSet: (exerciseName, setIndex, rpe) => {
        set((state) => {
          const exerciseSets = state.exercises[exerciseName];
          if (exerciseSets && exerciseSets[setIndex]) {
            exerciseSets[setIndex].completed = true;
            state.lastCompletedExercise = exerciseName;
            state.lastCompletedSetIndex = setIndex;
            
            if (rpe !== undefined) {
              exerciseSets[setIndex].rpe = rpe;
            }
            
            state.lastTabActivity = Date.now();
          }
        });
      },

      submitSetRating: (rpe) => {
        set((state) => {
          if (state.lastCompletedExercise && state.lastCompletedSetIndex !== null) {
            const exerciseSets = state.exercises[state.lastCompletedExercise];
            if (exerciseSets && exerciseSets[state.lastCompletedSetIndex]) {
              exerciseSets[state.lastCompletedSetIndex].rpe = rpe;
              state.postSetFlow = 'none';
              state.lastTabActivity = Date.now();
            }
          }
        });
      },

      triggerRestTimerReset: () => {
        set((state) => {
          state.restTimerResetSignal += 1;
          state.lastTabActivity = Date.now();
        });
      },

      setRestTimerActive: (active) => {
        set((state) => {
          state.restTimerActive = active;
          state.lastTabActivity = Date.now();
        });
      },

      setPostSetFlow: (flow) => {
        set((state) => {
          state.postSetFlow = flow;
          state.lastTabActivity = Date.now();
        });
      },

      startWorkout: () => {
        set((state) => {
          console.log('🚀 Starting new workout with timestamp');
          state.isActive = true;
          state.workoutStatus = 'active';
          state.workoutId = crypto.randomUUID();
          state.sessionId = crypto.randomUUID();
          state.startTime = Date.now(); // NEW: Set start time for validation
          state.explicitlyEnded = false;
          state.isRecoveryMode = false;
          state.lastTabActivity = Date.now();
          state.elapsedTime = 0;
        });
      },

      resetSession: () => {
        set((state) => {
          console.log('🔄 Resetting workout session');
          Object.assign(state, createInitialState());
          state.lastTabActivity = Date.now();
        });
      },

      setWorkoutStatus: (status) => {
        set((state) => {
          state.workoutStatus = status;
          state.lastTabActivity = Date.now();
        });
      },

      setTrainingConfig: (config) => {
        set((state) => {
          console.log('📋 Setting training config:', config);
          state.trainingConfig = config;
          state.lastTabActivity = Date.now();
        });
      },

      runWorkoutValidation: () => {
        const state = get();
        console.log('🔍 Running workout validation');
        
        const { isValid, issues, needsRepair } = validateWorkoutState(state, {
          showToasts: true,
          attemptRepair: true
        });
        
        if (!isValid && needsRepair) {
          console.warn('Workout validation failed, attempting repair');
          
          if (state.exercises && Object.keys(state.exercises).length > 0) {
            const repairedExercises = repairExercises(state.exercises);
            set((draft) => {
              draft.exercises = repairedExercises;
              draft.lastTabActivity = Date.now();
            });
          }
        }
        
        return { isValid, issues, needsRepair };
      },

      detectAndCleanupZombieWorkout: () => {
        const state = get();
        const isZombie = isZombieWorkout(state);
        
        if (isZombie) {
          console.log('🧟‍♂️ Zombie workout detected, cleaning up');
          get().resetSession();
          
          toast({
            title: "Workout Reset",
            description: "Detected and cleaned up an abandoned workout session",
            variant: "destructive"
          });
          
          return true;
        }
        
        return false;
      },
    })),
    {
      name: 'workout-storage',
      version: 1,
    }
  )
);
