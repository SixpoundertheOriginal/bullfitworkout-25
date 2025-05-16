
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
      return [];
    }

    return workouts.map(workout => {
      const workoutDate = new Date(workout.start_time).toISOString().split('T')[0];
      let totalVolume = 0;
      let totalSets = 0;

      if (workout.exercises && Array.isArray(workout.exercises)) {
        workout.exercises.forEach(exercise => {
          if (exercise && exercise.weight && exercise.reps && exercise.completed) {
            totalVolume += exercise.weight * exercise.reps;
            totalSets++;
          }
        });
      }

      return {
        date: workoutDate,
        volume: totalVolume,
        workoutId: workout.id,
        sets: totalSets
      };
    });
  }, [workouts]);

  return processedMetrics;
};
