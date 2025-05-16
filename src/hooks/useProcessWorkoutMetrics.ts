
import { useMemo } from 'react';
import { format } from 'date-fns';
import { WeightUnit, convertWeight } from '@/utils/unitConversion';

export interface VolumeDataPoint {
  date: string;            // ISO string
  originalDate: string;    // ISO string
  formattedDate: string;   // e.g. "May 4"
  volume: number;          // in user's weightUnit
}

export interface DensityDataPoint {
  date: string;
  formattedDate: string;
  overallDensity: number;    // volumeRate: unit/min
  activeOnlyDensity: number; // activeVolumeRate: unit/min
  totalTime: number;         // minutes
  restTime: number;          // minutes
  activeTime: number;        // minutes
}

interface WorkoutWithExercises {
  start_time: string;                 // ISO
  duration: number;                   // total session length in minutes
  exercises?: Array<{
    exercise_name: string;
    completed?: boolean;
    weight?: number;                  // in kg
    reps?: number;
    restTime?: number;                // in seconds
  }> | Record<string, any[]>;         // support both shapes
}

// Reusable helper functions, moved outside the hook
function flattenExercises(
  exercises: WorkoutWithExercises['exercises']
): any[] {
  if (!exercises) return [];
  if (Array.isArray(exercises)) return exercises;
  // else it's already grouped by exerciseName
  return Object.values(exercises).flat();
}

// Helper function to categorize time of day
function categorizeTimeOfDay(date: Date): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

// Helper for safe date parsing
function safeParseDate(dateStr: string): Date {
  try {
    return new Date(dateStr);
  } catch (e) {
    console.warn('Invalid date format:', dateStr);
    return new Date();
  }
}

// Helper to calculate workout volume
function calculateWorkoutVolume(workout: WorkoutWithExercises | null | undefined, weightUnit: WeightUnit): number {
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

export function useProcessWorkoutMetrics(
  workouts: WorkoutWithExercises[] | null | undefined,
  weightUnit: WeightUnit
) {
  // Added console log for debugging
  console.log('[useProcessWorkoutMetrics] Processing workouts:', 
    Array.isArray(workouts) ? workouts.length : 'no workouts',
    'with weight unit:', weightUnit);
  
  // --- Volume over time ---
  const volumeOverTimeData = useMemo<VolumeDataPoint[]>(() => {
    if (!Array.isArray(workouts) || workouts.length === 0) {
      console.log('[useProcessWorkoutMetrics] No valid workouts to process for volume data');
      return [];
    }

    // Use stable sorting and data transformation
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
          volume
        };
      })
      // sort ascending by date
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [workouts, weightUnit]);

  // --- Density over time ---
  const densityOverTimeData = useMemo<DensityDataPoint[]>(() => {
    if (!Array.isArray(workouts) || workouts.length === 0) {
      console.log('[useProcessWorkoutMetrics] No valid workouts to process for density data');
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

        // density metrics - CORRECTED FORMULA with safety checks:
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
          activeTime
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [workouts, weightUnit]);

  // --- Time of Day distribution --- (with additional safety)
  const durationByTimeOfDay = useMemo(() => {
    const timeDistribution = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    };
    
    if (!Array.isArray(workouts) || workouts.length === 0) {
      return timeDistribution;
    }

    workouts.forEach(workout => {
      if (!workout || !workout.start_time) return;
      
      try {
        const workoutDate = new Date(workout.start_time);
        const category = categorizeTimeOfDay(workoutDate);
        timeDistribution[category] += Number(workout.duration) || 0;
      } catch (e) {
        console.warn('Error processing workout time data:', e);
      }
    });

    return timeDistribution;
  }, [workouts]);

  // --- Volume statistics --- (improved with additional safety)
  const volumeStats = useMemo(() => {
    if (!Array.isArray(volumeOverTimeData) || volumeOverTimeData.length === 0) {
      return { total: 0, average: 0 };
    }
    
    const total = volumeOverTimeData.reduce((sum, pt) => sum + (pt.volume || 0), 0);
    const average = volumeOverTimeData.length > 0 ? total / volumeOverTimeData.length : 0;
    
    return { total, average };
  }, [volumeOverTimeData]);

  // --- Density statistics --- (improved with additional safety)
  const densityStats = useMemo(() => {
    if (!Array.isArray(densityOverTimeData) || densityOverTimeData.length === 0) {
      return {
        avgOverallDensity: 0,
        avgActiveOnlyDensity: 0,
        mostEfficientWorkout: null as DensityDataPoint | null
      };
    }
    
    const avgOverallDensity =
      densityOverTimeData.reduce((sum, pt) => sum + (pt.overallDensity || 0), 0) /
      densityOverTimeData.length;
      
    const avgActiveOnlyDensity =
      densityOverTimeData.reduce((sum, pt) => sum + (pt.activeOnlyDensity || 0), 0) /
      densityOverTimeData.length;
      
    const mostEfficientWorkout = densityOverTimeData.reduce(
      (best, pt) =>
        !best || (pt.activeOnlyDensity > best.activeOnlyDensity) ? pt : best,
      null as DensityDataPoint | null
    );
    
    return { avgOverallDensity, avgActiveOnlyDensity, mostEfficientWorkout };
  }, [densityOverTimeData]);

  // Include debug logs
  console.log('[useProcessWorkoutMetrics] Results:', {
    volumeDataPoints: volumeOverTimeData.length,
    densityDataPoints: densityOverTimeData.length,
    hasVolumeData: volumeOverTimeData.length > 0,
    hasDensityData: densityOverTimeData.length > 0
  });

  return {
    volumeOverTimeData,
    densityOverTimeData,
    volumeStats,
    densityStats,
    durationByTimeOfDay,
    hasVolumeData: volumeOverTimeData.length > 0,
    hasDensityData: densityOverTimeData.length > 0,
    hasTimeOfDayData: Object.values(durationByTimeOfDay).some(value => value > 0)
  };
}
