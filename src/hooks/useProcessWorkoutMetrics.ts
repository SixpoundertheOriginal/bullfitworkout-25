
import { useMemo } from 'react';
import { ExerciseSet } from '@/types/exercise';

// Ensure VolumeDataPoint includes sets property
export interface VolumeDataPoint {
  date: string;
  volume: number;
  workoutId?: string | null;
  sets?: number;
}

// Add the missing DensityDataPoint interface with all needed properties
export interface DensityDataPoint {
  date: string;
  density: number;
  volume?: number;
  duration?: number;
  workoutId?: string | null;
  overallDensity?: number;
  activeOnlyDensity?: number;
}

export const useProcessWorkoutMetrics = (workouts: any[]) => {
  const processedMetrics = useMemo(() => {
    if (!workouts || workouts.length === 0) {
      console.log("[useProcessWorkoutMetrics] No workouts data");
      return [];
    }

    console.log("[useProcessWorkoutMetrics] Processing workouts:", workouts.length);

    return workouts.map(workout => {
      const workoutDate = new Date(workout.start_time).toISOString().split('T')[0];
      let totalVolume = 0;
      let totalSets = 0;
      
      // Safely access exercises and handle different data structures
      const exercises = Array.isArray(workout.exercises) 
        ? workout.exercises 
        : [];

      if (exercises && exercises.length > 0) {
        exercises.forEach(exercise => {
          if (exercise && exercise.weight && exercise.reps && exercise.completed) {
            totalVolume += exercise.weight * exercise.reps;
            totalSets++;
          }
        });
      }

      // Calculate density if duration is available
      const duration = workout.duration || 0;
      const density = duration > 0 ? totalVolume / duration : 0;
      
      // Log the calculations
      console.log(`[useProcessWorkoutMetrics] Workout ${workout.id}: volume=${totalVolume}, duration=${duration}, density=${density}`);

      return {
        date: workoutDate,
        volume: totalVolume,
        workoutId: workout.id,
        sets: totalSets,
        duration: duration,
        density: density
      };
    });
  }, [workouts]);

  return processedMetrics;
};
