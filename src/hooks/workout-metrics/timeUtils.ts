
import { format } from 'date-fns';
import { TimeDistribution } from './types';

// Helper function to categorize time of day
export function categorizeTimeOfDay(date: Date): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

// Helper for safe date parsing
export function safeParseDate(dateStr: string): Date {
  try {
    return new Date(dateStr);
  } catch (e) {
    console.warn('Invalid date format:', dateStr);
    return new Date();
  }
}

// Process time of day distribution
export function processTimeOfDayDistribution(
  workouts: any[] | null | undefined
): TimeDistribution {
  const timeDistribution: TimeDistribution = {
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
}

// Format a date using date-fns with error handling
export function formatSafeDate(date: Date, formatString: string): string {
  try {
    return format(date, formatString);
  } catch (e) {
    console.warn('Error formatting date:', e);
    return 'Invalid date';
  }
}
