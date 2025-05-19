
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
}

export interface ExerciseSet {
  id?: string;
  workout_id?: string;
  exercise_name: string;
  weight: number;
  reps: number;
  set_number?: number;
  completed: boolean;
  isEditing: boolean;
  // Make restTime required to match LocalExerciseSet
  restTime: number;
  metadata?: {
    autoAdjusted?: boolean;
    previousValues?: {
      weight?: number;
      reps?: number;
      restTime?: number;
    };
  };
}

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
