import { useMemo } from 'react';
import { ExerciseSet } from '@/types/exercise';
import { calculateSetVolume } from '@/utils/exerciseUtils';

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

// Helper function to calculate volume for a set of exercises
export const calculateVolumeForExerciseSets = (
  exerciseName: string, 
  sets: ExerciseSet[]
): number => {
  return sets.reduce((total, set) => {
    if (set.completed) {
      return total + calculateSetVolume(set, exerciseName);
    }
    return total;
  }, 0);
};

// Helper function to calculate density for a set of exercises
export const calculateDensityForExerciseSets = (
  exerciseName: string, 
  sets: ExerciseSet[],
  duration?: number // if we know the actual duration
): number => {
  const volume = calculateVolumeForExerciseSets(exerciseName, sets);
  
  // If actual duration is provided, use it
  if (duration && duration > 0) {
    return volume / (duration / 60); // duration in seconds, convert to minutes
  }
  
  // Otherwise estimate based on completed sets
  const completedSets = sets.filter(set => set.completed).length;
  const avgTimePerSet = 45; // Average 45 seconds per set (estimate)
  const totalWorkTime = completedSets * avgTimePerSet;
  const workTimeInMinutes = totalWorkTime / 60;
  
  return workTimeInMinutes > 0 ? volume / workTimeInMinutes : 0;
};

export const useProcessWorkoutMetrics = (workouts: any[] = []) => {
  const processedMetrics = useMemo(() => {
    // Ensure workouts is always an array to prevent "length" property errors
    const safeWorkouts = Array.isArray(workouts) ? workouts : [];
    
    if (safeWorkouts.length === 0) {
      console.log("[useProcessWorkoutMetrics] No workouts data");
      return [];
    }

    console.log("[useProcessWorkoutMetrics] Processing workouts:", safeWorkouts.length);

    return safeWorkouts.map(workout => {
      if (!workout) {
        console.log("[useProcessWorkoutMetrics] Found null/undefined workout");
        return null;
      }
      
      const workoutDate = workout.start_time ? 
        new Date(workout.start_time).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0];
        
      let totalVolume = 0;
      let totalSets = 0;
      
      // Safely access exercises and handle different data structures
      const exercises = Array.isArray(workout.exercises) 
        ? workout.exercises 
        : Object.entries(workout.exercises || {}).flatMap(([name, sets]) => 
            Array.isArray(sets) ? sets.map(set => ({...set, exercise_name: name})) : []
          );

      if (exercises && exercises.length > 0) {
        exercises.forEach(exercise => {
          if (exercise && exercise.weight && exercise.reps && exercise.completed) {
            totalVolume += calculateSetVolume(
              exercise, 
              exercise.exercise_name || ''
            );
            totalSets++;
          }
        });
      }

      // Calculate density if duration is available
      const duration = workout.duration || 0;
      const density = duration > 0 ? totalVolume / duration : 0;
      
      // Log the calculations for debugging
      console.log(`[useProcessWorkoutMetrics] Workout ${workout.id}: volume=${totalVolume}, duration=${duration}, density=${density}`);

      return {
        date: workoutDate,
        volume: totalVolume,
        workoutId: workout.id,
        sets: totalSets,
        duration: duration,
        density: density
      };
    }).filter(Boolean); // Filter out any null values
  }, [workouts]); // Keep workouts as the only dependency

  return processedMetrics;
};
