
import { useEffect, useState } from 'react';
import { useWorkoutStats } from '@/hooks/useWorkoutStats';

interface PersonalRecord {
  exerciseName: string;
  value: number;
  unit: string;
  date: string;
  improvement?: number;
}

interface PersonalRecordsResult {
  records: PersonalRecord[];
  loading: boolean;
}

export function usePersonalRecords(): PersonalRecordsResult {
  const { workouts, loading } = useWorkoutStats();
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  
  useEffect(() => {
    if (loading || !workouts || !Array.isArray(workouts)) {
      return;
    }
    
    try {
      // Extract exercise data from workouts
      const exerciseData: Record<string, {maxWeight: number, date: string, previousMax?: number}> = {};
      
      // Process workouts in chronological order to track improvements
      const sortedWorkouts = [...workouts].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      sortedWorkouts.forEach(workout => {
        if (!workout.exercises || !Array.isArray(workout.exercises)) return;
        
        workout.exercises.forEach((set: any) => {
          if (!set.exercise_name || !set.weight || set.weight <= 0) return;
          
          const exerciseName = set.exercise_name;
          const weight = Number(set.weight);
          const date = workout.created_at || new Date().toISOString();
          
          if (!exerciseData[exerciseName] || weight > exerciseData[exerciseName].maxWeight) {
            // Store previous max to calculate improvement
            const previousMax = exerciseData[exerciseName]?.maxWeight;
            
            exerciseData[exerciseName] = { 
              maxWeight: weight, 
              date, 
              previousMax 
            };
          }
        });
      });
      
      // Convert to records array
      const recordsArray = Object.entries(exerciseData).map(([exerciseName, data]) => {
        // Calculate improvement percentage if previous max exists
        const improvement = data.previousMax ? 
          Math.round(((data.maxWeight - data.previousMax) / data.previousMax) * 100) : 
          undefined;
        
        return {
          exerciseName,
          value: data.maxWeight,
          unit: 'kg', // Default unit
          date: data.date,
          improvement
        };
      });
      
      // Sort by weight (descending) and limit to top records
      const topRecords = recordsArray
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
      
      setRecords(topRecords);
      
    } catch (error) {
      console.error("Error calculating personal records:", error);
      setRecords([]);
    }
  }, [workouts, loading]);
  
  return { records, loading };
}
