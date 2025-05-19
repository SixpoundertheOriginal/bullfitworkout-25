
export interface Exercise {
  id?: string;
  name: string;
  description: string;
  instructions?: {
    steps: string[];
    video_url?: string;
    image_url?: string;
  };
  primary_muscle_groups: string[];
  secondary_muscle_groups?: string[];
  equipment_type?: string[];
  is_compound?: boolean;
  is_custom?: boolean;
  difficulty?: string;
  media_url?: string;
  metadata?: Record<string, any>;
  variation_type?: string;
  variation_value?: string;
  created_at?: string;
  updated_at?: string;
  movement_pattern?: string;
  tips?: string[];
  variations?: string[];
  user_id?: string;
  base_exercise_id?: string;
  is_bodyweight?: boolean;
  load_factor?: number;
  duration?: number;
}

export interface ExerciseSet {
  id: string;
  workout_id?: string;
  exercise_name: string;
  weight: number;
  reps: number;
  set_number?: number;
  completed: boolean;
  isEditing: boolean;
  restTime: number;
  rpe?: number;
  duration?: number;
  weightCalculation?: WeightCalculation;
  metadata?: {
    autoAdjusted?: boolean;
    previousValues?: {
      weight?: number;
      reps?: number;
      restTime?: number;
    };
  };
}

// Define Weight Calculation for exercise weights
export interface WeightCalculation {
  value: number;
  isAuto: boolean;
  source: 'default' | 'user' | 'auto';
}

// Export type definitions needed by components
export type MuscleGroup = string;
export type EquipmentType = string;
export type MovementPattern = string;
export type Difficulty = string;

// Export the constants that are used in components
export const COMMON_MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'full body',
  'biceps', 'triceps', 'forearms', 'traps', 'lats', 'glutes', 'hamstrings',
  'quads', 'calves', 'abs', 'obliques', 'lower back'
];

export const COMMON_EQUIPMENT: EquipmentType[] = [
  'barbell', 'dumbbell', 'kettlebell', 'machine', 'cable', 'bodyweight',
  'resistance band', 'medicine ball', 'stability ball', 'smith machine',
  'suspension trainer', 'foam roller', 'bench', 'other'
];

export const MOVEMENT_PATTERNS: MovementPattern[] = [
  'push', 'pull', 'squat', 'hinge', 'lunge', 'rotation', 'carry', 'isometric', 'locomotion'
];

export const DIFFICULTY_LEVELS: Difficulty[] = [
  'beginner', 'intermediate', 'advanced', 'expert'
];

export interface ExercisePerformanceData {
  date: string;
  sets: ExerciseSet[];
  totalVolume: number;
  maxWeight: number;
  totalReps: number;
  avgRPE?: number;
}

export type ExercisePerformanceHistory = Record<string, ExercisePerformanceData[]>;

export interface ExerciseListItem {
  id?: string;
  name: string;
  muscle_groups: string[];
  equipment: string[];
  is_compound: boolean;
  is_custom?: boolean;
  difficulty?: string;
}

export interface ExerciseWithVariations extends Exercise {
  variations: string[] | Exercise[]; // Allow both string[] and Exercise[] for backward compatibility
}

export const EXERCISE_LOAD_FACTORS: Record<string, { factor: number }> = {
  "Push-up": { factor: 0.64 },
  "Pull-up": { factor: 1.0 },
  "Dips": { factor: 0.96 },
  "Squat": { factor: 1.0 },
  // Add more default exercise load factors as needed
};

export function calculateEffectiveWeight(exercise: Exercise, userWeight: number): number {
  return (exercise.is_bodyweight && userWeight) ? userWeight * (exercise.load_factor || 1.0) : 0;
}

export function getExerciseLoadFactor(exercise: Exercise): number {
  if (exercise.load_factor) return exercise.load_factor;
  if (EXERCISE_LOAD_FACTORS[exercise.name]) return EXERCISE_LOAD_FACTORS[exercise.name].factor;
  return 1.0;
}

export function isBodyweightExercise(exercise: Exercise): boolean {
  return exercise.is_bodyweight === true || (exercise.equipment_type || []).includes('bodyweight');
}
