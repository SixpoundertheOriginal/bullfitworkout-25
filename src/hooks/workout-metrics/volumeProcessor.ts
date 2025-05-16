
import { format } from 'date-fns';
import { WeightUnit, convertWeight } from '@/utils/unitConversion';
import { 
  VolumeDataPoint, 
  WorkoutWithExercises,
  VolumeStats 
} from './types';
import { safeParseDate } from './timeUtils';

// Helper to flatten exercises regardless of structure
export function flattenExercises(
  exercises: WorkoutWithExercises['exercises']
): any[] {
  if (!exercises) return [];
  if (Array.isArray(exercises)) return exercises;
  // else it's already grouped by exerciseName
  return Object.values(exercises).flat();
}

// Helper to calculate workout volume
export function calculateWorkoutVolume(
  workout: WorkoutWithExercises | null | undefined, 
  weightUnit: WeightUnit
): number {
  if (!workout) return 0;
  
  const allSets = flattenExercises(workout.exercises || []);
  const rawVolume = allSets.reduce((sum, set) => {
    if (set && set.completed && set.weight && set.reps) {
      return sum + (set.weight * set.reps);
    }
    return sum;
  }, 0);
  
  return convertWeight(rawVolume, 'kg', weightUnit);
}

// Process volume over time data
export function processVolumeOverTimeData(
  workouts: WorkoutWithExercises[] | null | undefined,
  weightUnit: WeightUnit
): VolumeDataPoint[] {
  if (!Array.isArray(workouts) || workouts.length === 0) {
    console.log('[processVolumeOverTimeData] No valid workouts to process');
    return [];
  }

  // Process and sort workouts
  return workouts
    .filter(workout => workout && workout.start_time) // Ensure valid workouts only
    .map((workout) => {
      const volume = calculateWorkoutVolume(workout, weightUnit);
      const dateObj = safeParseDate(workout.start_time);
      const formattedDate = format(dateObj, 'MMM d');

      return {
        date: workout.start_time,
        originalDate: workout.start_time,
        formattedDate,
        volume,
        workoutId: workout.id || undefined
      };
    })
    // sort ascending by date
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Calculate volume statistics
export function calculateVolumeStats(volumeData: VolumeDataPoint[]): VolumeStats {
  if (!Array.isArray(volumeData) || volumeData.length === 0) {
    return { total: 0, average: 0 };
  }
  
  const total = volumeData.reduce((sum, pt) => sum + (pt.volume || 0), 0);
  const average = volumeData.length > 0 ? total / volumeData.length : 0;
  
  return { total, average };
}
