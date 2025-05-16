
import { useState, useEffect, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { processWorkoutMetrics } from '@/utils/workoutMetricsProcessor';
import { WeightUnit } from '@/utils/unitConversion';

// Provides comparisons between two periods
export function useWorkoutComparisonStats(
  currentRange?: DateRange,
  previousRange?: DateRange,
  weightUnit: WeightUnit = 'kg'
) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentWorkouts, setCurrentWorkouts] = useState<any[]>([]);
  const [previousWorkouts, setPreviousWorkouts] = useState<any[]>([]);

  // Fetch workouts for a specific date range
  const fetchWorkoutsForRange = async (range?: DateRange) => {
    if (!user || !range?.from || !range?.to) return [];
    
    try {
      const from = new Date(range.from);
      const to = new Date(range.to);
      const adjustedTo = new Date(to);
      adjustedTo.setDate(adjustedTo.getDate() + 1);

      console.log(
        `[useWorkoutComparisonStats] Fetching workouts between ${from.toISOString()} and ${adjustedTo.toISOString()}`
      );

      const { data: workoutData, error } = await supabase
        .from('workout_sessions')
        .select('*, duration, exercises:exercise_sets(*)')
        .gte('start_time', from.toISOString())
        .lt('start_time', adjustedTo.toISOString())
        .order('start_time', { ascending: false });

      if (error) {
        console.error("[useWorkoutComparisonStats] Query error:", error);
        throw error;
      }
      
      return workoutData || [];
    } catch (err) {
      console.error("[useWorkoutComparisonStats] fetch error:", err);
      return [];
    }
  };

  // Fetch data when ranges change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch current period workouts
        if (currentRange?.from && currentRange?.to) {
          const current = await fetchWorkoutsForRange(currentRange);
          setCurrentWorkouts(current);
        }
        
        // Fetch previous period workouts if comparison is enabled
        if (previousRange?.from && previousRange?.to) {
          const previous = await fetchWorkoutsForRange(previousRange);
          setPreviousWorkouts(previous);
        } else {
          setPreviousWorkouts([]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user, currentRange?.from?.toString(), currentRange?.to?.toString(), 
      previousRange?.from?.toString(), previousRange?.to?.toString()]);
  
  // Process metrics for both periods
  const currentMetrics = useMemo(() => {
    return processWorkoutStats(currentWorkouts);
  }, [currentWorkouts]);
  
  const previousMetrics = useMemo(() => {
    return processWorkoutStats(previousWorkouts);
  }, [previousWorkouts]);
  
  // Calculate period-on-period changes
  const comparisons = useMemo(() => {
    if (!previousMetrics || !currentMetrics) {
      return {
        workoutCount: { value: 0, percentage: 0 },
        volume: { value: 0, percentage: 0 },
        density: { value: 0, percentage: 0 }
      };
    }
    
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return { value: current, percentage: current > 0 ? 100 : 0 };
      const diff = current - previous;
      const percentage = (diff / previous) * 100;
      return { value: diff, percentage };
    };
    
    return {
      workoutCount: calculateChange(
        currentMetrics.totalWorkouts || 0, 
        previousMetrics.totalWorkouts || 0
      ),
      volume: calculateChange(
        currentMetrics.totalVolume || 0, 
        previousMetrics.totalVolume || 0
      ),
      density: calculateChange(
        currentMetrics.density || 0, 
        previousMetrics.density || 0
      )
    };
  }, [currentMetrics, previousMetrics]);
  
  return {
    loading,
    currentWorkouts,
    previousWorkouts,
    currentMetrics,
    previousMetrics,
    comparisons,
    currentRange,
    previousRange
  };
}

// Helper function to process workout stats - simplified version of the main processor
function processWorkoutStats(workouts: any[]) {
  if (!workouts || workouts.length === 0) {
    return {
      totalWorkouts: 0,
      totalVolume: 0,
      density: 0
    };
  }

  let totalWorkouts = workouts.length;
  let totalVolume = 0;
  let totalDuration = 0;
  
  // Calculate total volume and duration
  workouts.forEach(workout => {
    totalDuration += workout.duration || 0;
    
    if (Array.isArray(workout.exercises)) {
      workout.exercises.forEach((set: any) => {
        if (set && set.weight && set.reps && set.completed) {
          totalVolume += set.weight * set.reps;
        }
      });
    }
  });
  
  // Calculate density (volume per minute)
  const density = totalDuration > 0 ? totalVolume / totalDuration : 0;
  
  return {
    totalWorkouts,
    totalVolume,
    totalDuration,
    density,
    avgDuration: totalWorkouts > 0 ? totalDuration / totalWorkouts : 0
  };
}
