
// src/hooks/useWorkoutStats.ts

import { useMemo, useState, useEffect, useCallback } from 'react';
import { ExerciseSet } from '@/types/exercise';
import { processWorkoutMetrics, ProcessedWorkoutMetrics } from '@/utils/workoutMetricsProcessor';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { WorkoutStats, WorkoutStatsResult } from '@/types/workout-metrics';
import { getExerciseGroup } from '@/utils/exerciseUtils';
import { useDateRange } from '@/context/DateRangeContext';
import { useWeightUnit } from '@/context/WeightUnitContext';
import { DateRange } from 'react-day-picker';
import { WeightUnit } from '@/utils/unitConversion';

// Use a safe wrapper to get context values with fallbacks
const useSafeContext = <T,>(useHook: () => T, fallback: T): T => {
  try {
    return useHook() || fallback;
  } catch (e) {
    console.warn("Context access error:", e);
    return fallback;
  }
};

// Default date range to prevent undefined values
const DEFAULT_DATE_RANGE: DateRange = {
  from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  to: new Date()
};

export function useWorkoutStats(
  exercises?: Record<string, ExerciseSet[]>,
  duration?: number,
  userBodyInfo?: { weight: number; unit: string }
): WorkoutStatsResult {
  console.log('[useWorkoutStats] Hook initialized');
  
  // Safely access contexts with fallbacks
  const weightUnitContext = useSafeContext(
    useWeightUnit, 
    { weightUnit: "kg" as WeightUnit, setWeightUnit: () => {}, saveWeightUnitPreference: async () => {}, isDefaultUnit: true, isLoading: false }
  );
  
  const weightUnit = weightUnitContext.weightUnit || "kg";
  
  const dateRangeContext = useSafeContext(
    useDateRange,
    { 
      dateRange: DEFAULT_DATE_RANGE,
      setDateRange: () => {},
      comparisonEnabled: false,
      setComparisonEnabled: () => {},
      comparisonDateRange: undefined,
      customComparisonRange: undefined,
      setCustomComparisonRange: () => {},
      useCustomComparison: false,
      setUseCustomComparison: () => {}
    }
  );
  
  // Create a stable, non-undefined dateRange reference
  const dateRange = useMemo(() => {
    if (!dateRangeContext.dateRange) return DEFAULT_DATE_RANGE;
    
    return {
      from: dateRangeContext.dateRange.from || DEFAULT_DATE_RANGE.from,
      to: dateRangeContext.dateRange.to || DEFAULT_DATE_RANGE.to
    };
  }, [dateRangeContext.dateRange]);

  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [stats, setStats] = useState<WorkoutStats>({
    totalWorkouts: 0,
    totalExercises: 0,
    totalSets: 0,
    totalDuration: 0,
    avgDuration: 0,
    workoutTypes: [],
    tags: [],
    recommendedType: undefined,
    recommendedDuration: 0,
    recommendedTags: [],
    progressMetrics: { volumeChangePercentage: 0, strengthTrend: 'stable', consistencyScore: 0 },
    streakDays: 0,
    workouts: [],
    timePatterns: {
      daysFrequency: { monday:0, tuesday:0, wednesday:0, thursday:0, friday:0, saturday:0, sunday:0 },
      durationByTimeOfDay: { morning:0, afternoon:0, evening:0, night:0 }
    },
    muscleFocus: {},
    exerciseVolumeHistory: [],
    lastWorkoutDate: undefined
  });

  // Backfill for individual workout metrics (used when you pass exercises+duration)
  const workoutMetrics = useMemo<ProcessedWorkoutMetrics | null>(() => {
    if (exercises && duration !== undefined) {
      return processWorkoutMetrics(exercises, duration, weightUnit, userBodyInfo);
    }
    return null;
  }, [exercises, duration, weightUnit, userBodyInfo]);

  // Fetch from Supabase when no specific exercises are passed
  // This function now has stable references to prevent rerenders
  const fetchWorkoutData = useCallback(async () => {
    if (!user) {
      console.warn("[useWorkoutStats] Cannot fetch workout data: User not authenticated");
      setLoading(false);
      return;
    }
    
    if (!dateRange || !dateRange.from || !dateRange.to) {
      console.warn("[useWorkoutStats] Invalid date range:", dateRange);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    console.log("[useWorkoutStats] Fetching workouts with dateRange:", 
      dateRange.from?.toISOString(),
      "to",
      dateRange.to?.toISOString());

    try {
      // Create stable date objects for query
      const from = dateRange.from;
      const to = dateRange.to;
      const adjustedTo = new Date(to);
      adjustedTo.setDate(adjustedTo.getDate() + 1);

      console.log(
        "[useWorkoutStats] Querying workouts between",
        from.toISOString(),
        "and",
        adjustedTo.toISOString()
      );

      const { data: workoutData, error } = await supabase
        .from('workout_sessions')
        .select('*, duration, exercises:exercise_sets(*)')
        .gte('start_time', from.toISOString())
        .lt('start_time', adjustedTo.toISOString())
        .order('start_time', { ascending: false });

      if (error) {
        console.error("[useWorkoutStats] Query error:", error);
        throw error;
      }
      
      // Store the fetched sessions
      const sessions = workoutData || [];
      console.log(`[useWorkoutStats] Fetched ${sessions.length} sessions`);
      setWorkouts(sessions);
      
      // Process the stats
      processWorkoutStats(sessions);
      
    } catch (err) {
      console.error("[useWorkoutStats] fetch error:", err);
      // Set empty data on error
      setWorkouts([]);
      
      // Reset stats to defaults
      setStats(prevStats => ({
        ...prevStats,
        totalWorkouts: 0,
        totalExercises: 0,
        totalSets: 0
      }));
      
    } finally {
      setLoading(false);
    }
  }, [user, dateRange?.from?.toString(), dateRange?.to?.toString()]);

  // Process the workout data into stats objects
  const processWorkoutStats = useCallback((sessions: any[]) => {
    // Summaries
    const totalWorkouts = sessions.length;
    const totalDuration = sessions.reduce((sum, w) => sum + (w.duration || 0), 0);
    const avgDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;

    // Counters & buckets
    let exerciseCount = 0;
    let setCount = 0;
    const typeCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};
    const daysFrequency = { monday:0, tuesday:0, wednesday:0, thursday:0, friday:0, saturday:0, sunday:0 };
    const durationByTimeOfDay = { morning:0, afternoon:0, evening:0, night:0 };
    const muscleCounts: Record<string, number> = {};
    const volumeByExercise: Record<string, number> = {};

    // Process each session
    sessions.forEach(w => {
      // Skip invalid sessions
      if (!w) return;
      
      // Workout type
      const t = w.training_type || 'Unknown';
      typeCounts[t] = (typeCounts[t] || 0) + 1;

      // Day frequency - with better error handling
      try {
        const dayKey = new Date(w.start_time)
          .toLocaleDateString('en-US', { weekday: 'long' })
          .toLowerCase() as keyof typeof daysFrequency;
          
        if (daysFrequency[dayKey] !== undefined) daysFrequency[dayKey]++;
      } catch (e) {
        console.warn('Error processing day frequency:', e);
      }

      // Time of day - with better error handling
      try {
        const hr = new Date(w.start_time).getHours();
        if (hr < 12) durationByTimeOfDay.morning += w.duration || 0;
        else if (hr < 17) durationByTimeOfDay.afternoon += w.duration || 0;
        else if (hr < 21) durationByTimeOfDay.evening += w.duration || 0;
        else durationByTimeOfDay.night += w.duration || 0;
      } catch (e) {
        console.warn('Error processing time of day:', e);
      }

      // Metadata tags
      if (w.metadata && typeof w.metadata === 'object' && w.metadata !== null) {
        const metadataObj = w.metadata as { tags?: string[] };
        if (metadataObj.tags && Array.isArray(metadataObj.tags)) {
          metadataObj.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      }

      // Exercises & sets - with better error handling
      if (Array.isArray(w.exercises)) {
        try {
          const names = w.exercises
            .filter((e: any) => e && e.exercise_name) 
            .map((e: any) => e.exercise_name);
            
          const unique = Array.from(new Set(names));
          exerciseCount += unique.length;
          setCount += w.exercises.length;

          unique.forEach(name => {
            if (!name) return;
            const muscle = getExerciseMainMuscleGroup(name as string);
            muscleCounts[muscle] = (muscleCounts[muscle] || 0) + 1;
          });

          w.exercises.forEach((s: any) => {
            if (!s) return;
            if (s.weight && s.reps && s.completed && s.exercise_name) {
              volumeByExercise[s.exercise_name] =
                (volumeByExercise[s.exercise_name] || 0) + s.weight * s.reps;
            }
          });
        } catch (e) {
          console.warn('Error processing exercise data:', e);
        }
      }
    });

    // Build arrays
    const workoutTypes = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count, percentage: (count/totalWorkouts)*100 }))
      .sort((a,b) => b.count - a.count);

    const tags = Object.entries(tagCounts)
      .map(([name,count]) => ({ name, count }))
      .sort((a,b) => b.count - a.count);

    const recommendedType = workoutTypes[0]?.type;
    const recentAvg = sessions.slice(0,10)
      .reduce((sum,w) => sum + (w.duration||0),0) / (Math.min(sessions.length,10)||1);
    const recommendedTags = tags.slice(0,3).map(t=>t.name);

    const streakDays = calculateStreakDays(sessions);

    const progressMetrics = { volumeChangePercentage:0, strengthTrend:'stable' as const, consistencyScore:0 };

    const exerciseVolumeHistory = Object.entries(volumeByExercise)
      .map(([exercise_name, volume]) => ({
        exercise_name,
        trend:'stable' as const,
        percentChange:0
      }))
      .sort((a,b) => b.percentChange - a.percentChange)
      .slice(0,5);

    const lastWorkoutDate = sessions[0]?.start_time;

    setStats({
      totalWorkouts,
      totalExercises: exerciseCount,
      totalSets: setCount,
      totalDuration,
      avgDuration: Math.round(avgDuration),
      workoutTypes,
      tags,
      recommendedType,
      recommendedDuration: Math.round(recentAvg),
      recommendedTags,
      progressMetrics,
      streakDays,
      workouts: sessions,
      timePatterns: { daysFrequency, durationByTimeOfDay },
      muscleFocus: muscleCounts,
      exerciseVolumeHistory,
      lastWorkoutDate
    });
  }, []);

  // Run fetch on mount & whenever dateRange changes
  useEffect(() => {
    if (!exercises && user) {
      // Avoid fetch loops by checking date fields
      console.log('[useWorkoutStats] Effect running, fetching workout data');
      fetchWorkoutData();
    } else if (exercises) {
      console.log('[useWorkoutStats] Using provided exercises, not fetching');
      setLoading(false);
    } else {
      console.log('[useWorkoutStats] No user or exercises, setting loading false');
      setLoading(false);
    }
  }, [fetchWorkoutData, exercises, user]);

  const refetch = useCallback(() => {
    console.log('[useWorkoutStats] Manual refetch requested');
    if (!exercises && user) fetchWorkoutData();
  }, [exercises, fetchWorkoutData, user]);

  // Return both processed & backward-compatible stats
  return {
    ...(workoutMetrics || {} as ProcessedWorkoutMetrics),
    stats,
    workouts,
    loading,
    refetch,
    dateRange
  } as WorkoutStatsResult;
}

// Helper functions for the workout stats processing
// Determine muscle group for an exercise
function getExerciseMainMuscleGroup(exerciseName: string): string {
  if (!exerciseName) return 'other';
  const muscleGroup = getExerciseGroup(exerciseName);
  return muscleGroup || 'other';
}

// Calculate streak days from workouts
function calculateStreakDays(sessions: any[]): number {
  if (!sessions || sessions.length === 0) return 0;

  try {
    // Sort sessions by date in ascending order
    const sortedSessions = [...sessions]
      .filter(session => session && session.start_time)
      .sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
    
    let currentStreak = 1;
    let maxStreak = 1;
    
    // Get unique dates (one workout per day counts)
    const uniqueDates = sortedSessions
      .map(session => {
        try {
          return new Date(session.start_time).toISOString().split('T')[0]
        } catch (e) {
          return null;
        }
      })
      .filter((date): date is string => !!date)
      .filter((date, index, self) => 
        self.indexOf(date) === index
      );
    
    // Calculate streaks
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i-1]);
      const currDate = new Date(uniqueDates[i]);
      
      // Check if dates are consecutive
      prevDate.setDate(prevDate.getDate() + 1);
      if (prevDate.toISOString().split('T')[0] === uniqueDates[i]) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return maxStreak;
  } catch (e) {
    console.error('Error calculating streak days:', e);
    return 0;
  }
}
