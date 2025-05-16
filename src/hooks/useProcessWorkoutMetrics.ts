
import { useMemo } from 'react';
import { WeightUnit } from '@/utils/unitConversion';

// Import types from the types file
import { 
  VolumeDataPoint, 
  DensityDataPoint,
  WorkoutWithExercises,
  ProcessedMetricsResult
} from './workout-metrics/types';

// Import utility functions
import { processTimeOfDayDistribution } from './workout-metrics/timeUtils';
import { 
  processVolumeOverTimeData, 
  calculateVolumeStats 
} from './workout-metrics/volumeProcessor';
import { 
  processDensityOverTimeData, 
  calculateDensityStats 
} from './workout-metrics/densityProcessor';

// Re-export types for backward compatibility
export type { VolumeDataPoint, DensityDataPoint };

// Main hook that orchestrates all the metrics processing
export function useProcessWorkoutMetrics(
  workouts: WorkoutWithExercises[] | null | undefined,
  weightUnit: WeightUnit
): ProcessedMetricsResult {
  // Add logging for debugging
  console.log('[useProcessWorkoutMetrics] Processing workouts:', 
    Array.isArray(workouts) ? workouts.length : 'no workouts',
    'with weight unit:', weightUnit);
  
  // Process volume data - memoized to prevent unnecessary recalculation
  const volumeOverTimeData = useMemo<VolumeDataPoint[]>(() => {
    return processVolumeOverTimeData(workouts, weightUnit);
  }, [workouts, weightUnit]);

  // Process density data - memoized to prevent unnecessary recalculation
  const densityOverTimeData = useMemo<DensityDataPoint[]>(() => {
    return processDensityOverTimeData(workouts, weightUnit);
  }, [workouts, weightUnit]);

  // Process time of day distribution - memoized
  const durationByTimeOfDay = useMemo(() => {
    return processTimeOfDayDistribution(workouts);
  }, [workouts]);

  // Calculate volume statistics - memoized
  const volumeStats = useMemo(() => {
    return calculateVolumeStats(volumeOverTimeData);
  }, [volumeOverTimeData]);

  // Calculate density statistics - memoized
  const densityStats = useMemo(() => {
    return calculateDensityStats(densityOverTimeData);
  }, [densityOverTimeData]);

  // Check data availability flags
  const hasVolumeData = volumeOverTimeData.length > 0;
  const hasDensityData = densityOverTimeData.length > 0;
  const hasTimeOfDayData = Object.values(durationByTimeOfDay).some(value => value > 0);

  // Include debug logs for troubleshooting
  console.log('[useProcessWorkoutMetrics] Results:', {
    volumeDataPoints: volumeOverTimeData.length,
    densityDataPoints: densityOverTimeData.length,
    hasVolumeData,
    hasDensityData
  });

  // Return processed data and metrics
  return {
    volumeOverTimeData,
    densityOverTimeData,
    volumeStats,
    densityStats,
    durationByTimeOfDay,
    hasVolumeData,
    hasDensityData,
    hasTimeOfDayData
  };
}
