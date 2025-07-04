import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { produce } from 'immer';
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
  setElapsedTime: (time: number | ((prev: number) => number)) => void;
}

const createInitialState = (): WorkoutState => ({
  exercises: {},
  activeExercise: null,
  focusedExercise: null,
  focusedSetIndex: null,
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
  postSetFlow: 'idle',
  lastCompletedExercise: null,
  lastCompletedSetIndex: null,
  trainingConfig: null,
  startTime: null,
  createdAt: null, // NEW: Track when workout was created
});

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    subscribeWithSelector(
      (set, get) => ({
        ...createInitialState(),

        setExercises: (exercises) => {
          set(
            produce((state) => {
              if (typeof exercises === 'function') {
                state.exercises = exercises(state.exercises);
              } else {
                state.exercises = exercises;
              }
              state.lastTabActivity = Date.now();
            })
          );
        },

        setElapsedTime: (time) => {
          set(
            produce((state) => {
              if (typeof time === 'function') {
                state.elapsedTime = time(state.elapsedTime);
              } else {
                state.elapsedTime = time;
              }
              state.lastTabActivity = Date.now();
            })
          );
        },

        addExercise: (exerciseName) => {
          set(
            produce((state) => {
              if (!state.exercises[exerciseName]) {
                state.exercises[exerciseName] = [];
                state.lastTabActivity = Date.now();
              }
            })
          );
        },

        deleteExercise: (exerciseName) => {
          set(
            produce((state) => {
              delete state.exercises[exerciseName];
              if (state.activeExercise === exerciseName) {
                state.activeExercise = null;
              }
              if (state.focusedExercise === exerciseName) {
                state.focusedExercise = null;
              }
              state.lastTabActivity = Date.now();
            })
          );
        },

        updateLastActiveRoute: (route) => {
          set(
            produce((state) => {
              state.lastActiveRoute = route;
              state.lastTabActivity = Date.now();
            })
          );
        },

        setActiveExercise: (exerciseName) => {
          set(
            produce((state) => {
              state.activeExercise = exerciseName;
              state.lastTabActivity = Date.now();
            })
          );
        },

        setFocusedExercise: (exerciseName) => {
          set(
            produce((state) => {
              state.focusedExercise = exerciseName;
              state.lastTabActivity = Date.now();
            })
          );
        },

        handleCompleteSet: (exerciseName, setIndex, rpe) => {
          set(
            produce((state) => {
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
            })
          );
        },

        submitSetRating: (rpe) => {
          set(
            produce((state) => {
              if (state.lastCompletedExercise && state.lastCompletedSetIndex !== null) {
                const exerciseSets = state.exercises[state.lastCompletedExercise];
                if (exerciseSets && exerciseSets[state.lastCompletedSetIndex]) {
                  exerciseSets[state.lastCompletedSetIndex].rpe = rpe;
                  state.postSetFlow = 'idle';
                  state.lastTabActivity = Date.now();
                }
              }
            })
          );
        },

        triggerRestTimerReset: () => {
          set(
            produce((state) => {
              state.restTimerResetSignal += 1;
              state.lastTabActivity = Date.now();
            })
          );
        },

        setRestTimerActive: (active) => {
          set(
            produce((state) => {
              state.restTimerActive = active;
              state.lastTabActivity = Date.now();
            })
          );
        },

        setPostSetFlow: (flow) => {
          set(
            produce((state) => {
              state.postSetFlow = flow;
              state.lastTabActivity = Date.now();
            })
          );
        },

        startWorkout: () => {
          set(
            produce((state) => {
              const now = Date.now();
              console.log('🚀 Starting new workout with timestamp');
              state.isActive = true;
              state.workoutStatus = 'active';
              state.workoutId = crypto.randomUUID();
              state.sessionId = crypto.randomUUID();
              state.startTime = now;
              state.createdAt = now; // NEW: Set creation timestamp
              state.explicitlyEnded = false;
              state.isRecoveryMode = false;
              state.lastTabActivity = now;
              state.elapsedTime = 0;
            })
          );
        },

        resetSession: () => {
          set(
            produce((state) => {
              console.log('🔄 Resetting workout session');
              Object.assign(state, createInitialState());
              state.lastTabActivity = Date.now();
            })
          );
        },

        setWorkoutStatus: (status) => {
          set(
            produce((state) => {
              state.workoutStatus = status;
              state.lastTabActivity = Date.now();
            })
          );
        },

        setTrainingConfig: (config) => {
          set(
            produce((state) => {
              console.log('📋 Setting training config:', config);
              state.trainingConfig = config;
              state.lastTabActivity = Date.now();
            })
          );
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
              set(
                produce((draft) => {
                  draft.exercises = repairedExercises;
                  draft.lastTabActivity = Date.now();
                })
              );
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
      })
    ),
    {
      name: 'workout-storage',
      version: 1,
    }
  )
);

// Export getStore function for external access
export const getStore = () => useWorkoutStore.getState;
