
export interface WorkoutStats {
  totalWorkouts: number;
  totalXp?: number;
  lastWorkoutDate?: string;
  recommendedType?: string;
  recommendedDuration?: number;
  workoutTypeDistribution?: {
    name: string;
    count: number;
    averageDuration?: number;
    improvement?: number;
  }[];
}
