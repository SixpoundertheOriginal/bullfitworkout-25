
import { TrainingConfig } from '@/hooks/useTrainingSetupPersistence';

export interface ExerciseSet {
  id: string;
  workout_id: string; 
  exercise_name: string;
  weight: number;
  reps: number;
  set_number: number;
  completed: boolean;
  isEditing: boolean;
  restTime: number;
  rpe?: number;
  metadata?: {
    autoAdjusted?: boolean;
    autoCreated?: boolean; // Added this property to match usage in actions.ts
    exerciseName?: string;
    createdAt?: string;
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
  details?: any;
}

// Post-set flow state management
export type PostSetFlowState =
  | 'idle'        // No active post-set flow
  | 'rating'      // Showing RPE rating UI
  | 'resting'     // In rest period with enhanced timer
  | 'preparing';  // Preparing for next set

// Add WorkoutState interface to fix import issues
export interface WorkoutState {
  exercises: WorkoutExercises;
  activeExercise: string | null;
  elapsedTime: number;
  workoutId: string | null;
  startTime: string | null;
  workoutStatus: WorkoutStatus;
  trainingConfig: TrainingConfig | null;
  focusedExercise: string | null;
  focusedSetIndex: number | null;
  postSetFlow: PostSetFlowState;
  lastCompletedExercise: string | null;
  lastCompletedSetIndex: number | null;
  restTimerActive: boolean;
  currentRestTime: number;
  isActive: boolean;
  lastActiveRoute: string;
  sessionId: string;
  explicitlyEnded: boolean;
  lastTabActivity: number;
  savingErrors: WorkoutError[];
}
