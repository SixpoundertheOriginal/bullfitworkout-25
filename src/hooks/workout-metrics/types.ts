
// Define all shared types for workout metrics processing
import { WeightUnit } from '@/utils/unitConversion';

export interface VolumeDataPoint {
  date: string;            // ISO string
  originalDate: string;    // ISO string
  formattedDate: string;   // e.g. "May 4"
  volume: number;          // in user's weightUnit
  workoutId?: string;      // ID of the workout for navigation
}

export interface DensityDataPoint {
  date: string;
  formattedDate: string;
  overallDensity: number;    // volumeRate: unit/min
  activeOnlyDensity: number; // activeVolumeRate: unit/min
  totalTime: number;         // minutes
  restTime: number;          // minutes
  activeTime: number;        // minutes
  workoutId?: string;        // ID of the workout for navigation
}

export interface WorkoutWithExercises {
  id?: string;                      // Workout ID for navigation
  start_time: string;               // ISO
  duration: number;                 // total session length in minutes
  exercises?: Array<{
    exercise_name: string;
    completed?: boolean;
    weight?: number;                // in kg
    reps?: number;
    restTime?: number;              // in seconds
  }> | Record<string, any[]>;       // support both shapes
}

export interface TimeDistribution {
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
}

export interface VolumeStats {
  total: number;
  average: number;
}

export interface DensityStats {
  avgOverallDensity: number;
  avgActiveOnlyDensity: number;
  mostEfficientWorkout: DensityDataPoint | null;
}

export interface ProcessedMetricsResult {
  volumeOverTimeData: VolumeDataPoint[];
  densityOverTimeData: DensityDataPoint[];
  volumeStats: VolumeStats;
  densityStats: DensityStats;
  durationByTimeOfDay: TimeDistribution;
  hasVolumeData: boolean;
  hasDensityData: boolean;
  hasTimeOfDayData: boolean;
}
