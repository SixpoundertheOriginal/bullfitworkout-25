
import { useEffect, useState } from 'react';
import { useWorkoutStats } from '@/hooks/useWorkoutStats';

interface TrainingQualityResult {
  score: number;
  previousScore?: number;
  factors: {
    consistency: number;
    volume: number;
    variety: number;
    intensity: number;
  };
  loading: boolean;
}

export function useTrainingQuality(): TrainingQualityResult {
  const { stats, loading, workouts } = useWorkoutStats();
  const [qualityScore, setQualityScore] = useState<TrainingQualityResult>({
    score: 0,
    factors: {
      consistency: 0,
      volume: 0,
      variety: 0,
      intensity: 0
    },
    loading: true
  });
  
  useEffect(() => {
    if (loading || !stats || !workouts) {
      return;
    }
    
    try {
      // Calculate consistency score (based on streak and workout frequency)
      const streakDays = stats.streakDays || 0;
      const workoutCount = stats.totalWorkouts || 0;
      const consistencyScore = Math.min(100, (streakDays * 15) + (workoutCount > 0 ? 40 : 0));
      
      // Calculate volume score (based on weekly volume compared to target)
      const weeklyVolume = stats.weeklyVolume || 0;
      const targetVolume = 5000; // Example target weekly volume
      const volumeScore = Math.min(100, (weeklyVolume / targetVolume) * 100);
      
      // Calculate variety score (based on different exercise types)
      const uniqueExercises = new Set();
      let totalExercises = 0;
      
      workouts.forEach(workout => {
        if (workout.exercises && Array.isArray(workout.exercises)) {
          workout.exercises.forEach((exercise: any) => {
            if (exercise.exercise_name) {
              uniqueExercises.add(exercise.exercise_name);
              totalExercises++;
            }
          });
        }
      });
      
      const varietyScore = Math.min(100, (uniqueExercises.size / Math.max(1, workouts.length)) * 50);
      
      // Calculate intensity score (based on average RPE or weight progression)
      const intensityScore = Math.min(100, stats.progressMetrics?.volumeChangePercentage ? 
        50 + stats.progressMetrics.volumeChangePercentage : 50);
      
      // Calculate overall quality score (weighted average)
      const overallScore = Math.round(
        (consistencyScore * 0.4) + 
        (volumeScore * 0.3) + 
        (varietyScore * 0.2) + 
        (intensityScore * 0.1)
      );
      
      // Get previous period data for comparison (simplified)
      const previousScore = stats.lastWeekVolume && stats.weeklyVolume ? 
        Math.round(overallScore * (stats.lastWeekVolume / stats.weeklyVolume)) : 
        undefined;
      
      setQualityScore({
        score: overallScore,
        previousScore,
        factors: {
          consistency: Math.round(consistencyScore),
          volume: Math.round(volumeScore),
          variety: Math.round(varietyScore),
          intensity: Math.round(intensityScore)
        },
        loading: false
      });
      
    } catch (error) {
      console.error("Error calculating training quality:", error);
      
      // Set default values on error
      setQualityScore({
        score: 0,
        factors: {
          consistency: 0,
          volume: 0,
          variety: 0,
          intensity: 0
        },
        loading: false
      });
    }
  }, [loading, stats, workouts]);
  
  return qualityScore;
}
