
import { useEffect, useState } from 'react';
import { useWorkoutStats } from '@/hooks/useWorkoutStats';

interface MuscleGroupData {
  name: string;
  value: number;
  fullMark: number;
}

interface WorkoutBalanceResult {
  data: MuscleGroupData[];
  loading: boolean;
}

export function useWorkoutBalance(): WorkoutBalanceResult {
  const { stats, loading } = useWorkoutStats();
  const [balanceData, setBalanceData] = useState<MuscleGroupData[]>([]);
  
  useEffect(() => {
    if (loading || !stats || !stats.muscleFocus) {
      return;
    }
    
    try {
      // Define primary muscle groups for balanced training
      const primaryGroups = [
        "chest",
        "back",
        "legs",
        "shoulders",
        "arms",
        "core"
      ];
      
      // Normalize muscle data from stats
      const muscleData: MuscleGroupData[] = [];
      let maxValue = 0;
      
      // Process each primary group
      primaryGroups.forEach(group => {
        // Look for matching muscle groups in stats
        let groupValue = 0;
        
        // Get value from stats.muscleFocus if it exists
        if (stats.muscleFocus) {
          Object.entries(stats.muscleFocus).forEach(([muscle, count]) => {
            if (muscle.toLowerCase().includes(group.toLowerCase())) {
              groupValue += Number(count) || 0;
            }
          });
        }
        
        // Update max value for scaling
        maxValue = Math.max(maxValue, groupValue);
        
        // Add to data array
        muscleData.push({
          name: group.charAt(0).toUpperCase() + group.slice(1),
          value: groupValue,
          fullMark: 100
        });
      });
      
      // Normalize values relative to max (scale to 0-100)
      const normalizedData = muscleData.map(item => ({
        ...item,
        value: maxValue > 0 ? Math.round((item.value / maxValue) * 100) : 0
      }));
      
      setBalanceData(normalizedData);
      
    } catch (error) {
      console.error("Error calculating workout balance:", error);
      setBalanceData([]);
    }
  }, [stats, loading]);
  
  return { data: balanceData, loading };
}
