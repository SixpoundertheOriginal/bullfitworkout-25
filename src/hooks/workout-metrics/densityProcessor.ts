
import { format } from 'date-fns';
import { WeightUnit } from '@/utils/unitConversion';
import { 
  DensityDataPoint, 
  WorkoutWithExercises,
  DensityStats
} from './types';
import { safeParseDate } from './timeUtils';
import { calculateWorkoutVolume, flattenExercises } from './volumeProcessor';

// Process density over time data
export function processDensityOverTimeData(
  workouts: WorkoutWithExercises[] | null | undefined,
  weightUnit: WeightUnit
): DensityDataPoint[] {
  if (!Array.isArray(workouts) || workouts.length === 0) {
    console.log('[processDensityOverTimeData] No valid workouts to process');
    return [];
  }

  return workouts
    .filter(workout => workout && workout.start_time) // Ensure valid workouts only
    .map((workout) => {
      const volume = calculateWorkoutVolume(workout, weightUnit);
      
      // total session time in minutes (with fallback)
      const totalTime = workout.duration || 0;

      // Calculate rest time with better error handling
      const allSets = flattenExercises(workout.exercises || []);
      const restTimeSec = allSets.reduce(
        (sum, set) => sum + (set && typeof set.restTime === 'number' ? set.restTime : 0),
        0
      );
      const restTime = restTimeSec / 60;

      // active time in minutes (with bounds check)
      const activeTime = Math.max(0, totalTime - restTime);

      // density metrics with safety checks
      const overallDensity = totalTime > 0 ? volume / totalTime : 0;
      const activeOnlyDensity = activeTime > 0 ? volume / activeTime : 0;

      const dateObj = safeParseDate(workout.start_time);
      const formattedDate = format(dateObj, 'MMM d');

      return {
        date: workout.start_time,
        formattedDate,
        overallDensity,
        activeOnlyDensity,
        totalTime,
        restTime,
        activeTime,
        workoutId: workout.id || undefined
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Calculate density statistics
export function calculateDensityStats(densityData: DensityDataPoint[]): DensityStats {
  if (!Array.isArray(densityData) || densityData.length === 0) {
    return {
      avgOverallDensity: 0,
      avgActiveOnlyDensity: 0,
      mostEfficientWorkout: null
    };
  }
  
  const avgOverallDensity =
    densityData.reduce((sum, pt) => sum + (pt.overallDensity || 0), 0) /
    densityData.length;
    
  const avgActiveOnlyDensity =
    densityData.reduce((sum, pt) => sum + (pt.activeOnlyDensity || 0), 0) /
    densityData.length;
    
  const mostEfficientWorkout = densityData.reduce(
    (best, pt) =>
      !best || (pt.activeOnlyDensity > best.activeOnlyDensity) ? pt : best,
    null as DensityDataPoint | null
  );
  
  return { avgOverallDensity, avgActiveOnlyDensity, mostEfficientWorkout };
}
