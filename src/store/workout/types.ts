
export type WorkoutStatus = 
  | 'idle'        // Initial state
  | 'active'      // Workout in progress
  | 'saving'      // Saving in progress
  | 'saved'       // Successfully saved
  | 'failed'      // Save failed
  | 'partial'     // Partially saved
  | 'recovering'; // Attempting recovery

export type PostSetFlowState = 'idle' | 'rating' | 'rest';

export interface ExerciseSet {
  id: string;
  exercise_name: string;
  weight: number;
  reps: number;
  restTime: number;
  completed: boolean;
  set_number: number;
  isEditing?: boolean;
  rpe?: number;
  workout_id?: string;
}

export interface WorkoutExercises {
  [exerciseName: string]: ExerciseSet[];
}

export interface WorkoutError {
  type: 'network' | 'database' | 'validation' | 'unknown';
  message: string;
  details?: any;
  timestamp: string;
  recoverable: boolean;
}

export interface WorkoutState {
  exercises: WorkoutExercises;
  activeExercise: string | null;
  focusedExercise: string | null;
  focusedSetIndex: number | null;
  elapsedTime: number;
  isActive: boolean;
  workoutStatus: WorkoutStatus;
  restTimerActive: boolean;
  restTimerResetSignal: number;
  currentRestTime: number;
  workoutId: string | null;
  sessionId: string | null;
  isRecoveryMode: boolean;
  explicitlyEnded: boolean;
  savingErrors: WorkoutError[];
  lastActiveRoute: string | null;
  lastTabActivity: number;
  postSetFlow: PostSetFlowState;
  lastCompletedExercise: string | null;
  lastCompletedSetIndex: number | null;
  trainingConfig: any;
  startTime: number | null;
  createdAt: number | null; // NEW: Track when workout was created
}
