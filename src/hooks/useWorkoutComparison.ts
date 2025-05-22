import { useEffect, useState } from 'react';
import { useWorkoutStats } from '@/hooks/useWorkoutStats';
import { subDays, startOfWeek, endOfWeek } from 'date-fns';
import { WorkoutStats } from '@/types/workoutStats';

export interface WorkoutComparison {
  currentWeek: {
    workouts: number;
    volume: number;
    duration: number;
  };
  previousWeek: {
    workouts: number;
    volume: number;
    duration: number;
  };
  changes: {
    workouts: {
      absolute: number;
      percentage: number;
    };
    volume: {
      absolute: number;
      percentage: number;
    };
    duration: {
      absolute: number;
      percentage: number;
    };
  };
}

export function useWorkoutComparison() {
  const { stats, workouts, loading } = useWorkoutStats();
  const [comparison, setComparison] = useState<WorkoutComparison | null>(null);
  
  useEffect(() => {
    if (loading || !workouts || !Array.isArray(workouts)) {
      return;
    }
    
    try {
      // Get current date for calculations
      const now = new Date();
      
      // Define current week range
      const currentWeekStart = startOfWeek(now);
      const currentWeekEnd = endOfWeek(now);
      
      // Define previous week range
      const previousWeekStart = subDays(currentWeekStart, 7);
      const previousWeekEnd = subDays(currentWeekEnd, 7);
      
      // Filter workouts for current and previous weeks
      const currentWeekWorkouts = workouts.filter(workout => {
        const workoutDate = new Date(workout.created_at);
        return workoutDate >= currentWeekStart && workoutDate <= currentWeekEnd;
      });
      
      const previousWeekWorkouts = workouts.filter(workout => {
        const workoutDate = new Date(workout.created_at);
        return workoutDate >= previousWeekStart && workoutDate <= previousWeekEnd;
      });
      
      // Calculate metrics for both weeks
      const currentWeek = {
        workouts: currentWeekWorkouts.length,
        volume: currentWeekWorkouts.reduce((sum, workout) => sum + (workout.metrics?.performance?.volume || 0), 0),
        duration: currentWeekWorkouts.reduce((sum, workout) => sum + (workout.duration || 0), 0),
      };
      
      const previousWeek = {
        workouts: previousWeekWorkouts.length,
        volume: previousWeekWorkouts.reduce((sum, workout) => sum + (workout.metrics?.performance?.volume || 0), 0),
        duration: previousWeekWorkouts.reduce((sum, workout) => sum + (workout.duration || 0), 0),
      };
      
      // Calculate changes
      const calculateChange = (current: number, previous: number) => {
        const absolute = current - previous;
        const percentage = previous !== 0 ? Math.round((absolute / previous) * 100) : 0;
        return { absolute, percentage };
      };
      
      const changes = {
        workouts: calculateChange(currentWeek.workouts, previousWeek.workouts),
        volume: calculateChange(currentWeek.volume, previousWeek.volume),
        duration: calculateChange(currentWeek.duration, previousWeek.duration),
      };
      
      // Set comparison data
      setComparison({
        currentWeek,
        previousWeek,
        changes
      });
      
      // Update the stats object with weekly comparison data
      if (stats) {
        // Create a mutable typed variable
        const statsCopy = stats as WorkoutStats;
        
        // Update weekly stats properly
        statsCopy.weeklyWorkouts = currentWeek.workouts;
        statsCopy.lastWeekWorkouts = previousWeek.workouts;
        statsCopy.weeklyVolume = currentWeek.volume;
        statsCopy.lastWeekVolume = previousWeek.volume;
        
        // Create dailyWorkouts object if it doesn't exist
        if (!statsCopy.dailyWorkouts) {
          statsCopy.dailyWorkouts = {};
        }
      }
    } catch (error) {
      console.error("Error calculating workout comparison:", error);
      setComparison(null);
    }
  }, [workouts, loading, stats]);
  
  return { comparison, loading };
}
