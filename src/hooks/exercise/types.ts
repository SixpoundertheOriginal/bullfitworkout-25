
import { Exercise } from '@/types/exercise';

export type ExerciseMetadata = {
  default_weight?: number;
  default_reps?: number;
  weight_unit?: string;
  normalized_weight?: number;
  display_unit?: string;
  is_bodyweight?: boolean;
  energy_cost_factor?: number;
  variations?: any[]; // To store additional variations beyond the 1:1 field
  media_urls?: string[]; // To store multiple media URLs
};

export type ExerciseInput = {
  name: string;
  description: string;
  user_id: string;
  primary_muscle_groups: string[];
  secondary_muscle_groups: string[];
  equipment_type: string[];
  movement_pattern: string;
  difficulty: string;
  instructions: {
    steps: string[];
    video_url?: string;
    image_url?: string;
  };
  is_compound: boolean; // Kept required to match database expectations
  tips?: string[];
  variations?: string[]; // String array only to match database schema
  metadata?: Record<string, any>;
  base_exercise_id?: string;
  variation_type?: string;
  variation_value?: string;
  is_bodyweight?: boolean;
  energy_cost_factor?: number;
  // Additional fields
  media_url?: string;
  variationList?: any[];
  created_at?: string;
  updated_at?: string;
  is_custom?: boolean;
  load_factor?: number;
  duration?: number;
};

export type ExerciseUpdateInput = Partial<Omit<ExerciseInput, 'created_at'>> & { id: string };

export type ExerciseSortBy = 'name' | 'created_at' | 'difficulty';
export type SortOrder = 'asc' | 'desc';
