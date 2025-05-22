
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
  // Weekly comparison data
  weeklyWorkouts?: number;
  lastWeekWorkouts?: number;
  weeklyVolume?: number;
  lastWeekVolume?: number;
  dailyWorkouts?: Record<string, number>;
  streakDays?: number;
  totalDuration?: number;
  avgDuration?: number;
  density?: number;
}
