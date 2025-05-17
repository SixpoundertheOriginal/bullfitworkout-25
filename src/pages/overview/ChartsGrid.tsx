
import React from 'react';
import { ChartSection } from './ChartSection';
import { WorkoutTypeChart } from "@/components/metrics/WorkoutTypeChart";
import { MuscleGroupChart } from "@/components/metrics/MuscleGroupChart";
import { TimeOfDayChart } from "@/components/metrics/TimeOfDayChart";
import { WorkoutDaysChart } from "@/components/metrics/WorkoutDaysChart";
import { TopExercisesTable } from "@/components/metrics/TopExercisesTable";
import { useDateRange } from '@/context/DateRangeContext';

export interface ChartsGridProps {
  stats: any;
  weightUnit: string;
  comparisonStats?: {
    volumeData?: any;
    workouts?: any[];
    timePatterns?: {
      daysFrequency?: Record<string, number>;
      durationByTimeOfDay?: {
        morning: number;
        afternoon: number;
        evening: number;
        night: number;
      };
    };
    muscleFocus?: Record<string, number>;
    exerciseVolumeHistory?: any[];
  };
}

export const ChartsGrid: React.FC<ChartsGridProps> = ({ 
  stats, 
  weightUnit,
  comparisonStats
}) => {
  const { comparisonEnabled } = useDateRange();
  
  // Extract comparison data with safety checks
  const hasComparisonData = comparisonEnabled && !!comparisonStats;
  
  console.log("[ChartsGrid] Comparison enabled:", comparisonEnabled);
  console.log("[ChartsGrid] Comparison stats:", comparisonStats);
  
  // Prepare comparison workout types data if available
  const comparisonWorkoutTypes = React.useMemo(() => {
    if (!hasComparisonData || !comparisonStats?.workouts || !Array.isArray(comparisonStats.workouts)) {
      console.log("[ChartsGrid] No valid comparison workout data");
      return undefined;
    }
    
    try {
      // Group workouts by training type
      const typeCount: Record<string, { count: number, totalDuration: number }> = {};
      comparisonStats.workouts.forEach(workout => {
        if (!workout) return;
        
        const type = workout.training_type || 'Other';
        if (!typeCount[type]) {
          typeCount[type] = { count: 0, totalDuration: 0 };
        }
        typeCount[type].count += 1;
        typeCount[type].totalDuration += workout.duration || 0;
      });
      
      // Format for the chart
      return Object.entries(typeCount).map(([type, data]) => ({
        type,
        count: data.count,
        totalDuration: data.totalDuration,
        averageDuration: data.count > 0 ? data.totalDuration / data.count : 0
      }));
    } catch (error) {
      console.error("[ChartsGrid] Error processing comparison workouts:", error);
      return undefined;
    }
  }, [hasComparisonData, comparisonStats?.workouts]);
  
  console.log("[ChartsGrid] Processed comparison workout types:", comparisonWorkoutTypes);

  // Chart configurations with explicit safety checks
  const chartConfigs = [
    {
      title: "Workout Types",
      renderComponent: (data: any) => (
        <WorkoutTypeChart 
          workoutTypes={data} 
          height={250}
          comparisonData={hasComparisonData ? comparisonWorkoutTypes : undefined}
        />
      ),
      data: stats?.workoutTypes || []
    },
    {
      title: "Muscle Focus",
      renderComponent: (data: any) => (
        <MuscleGroupChart 
          muscleFocus={data} 
          height={250}
          comparisonData={hasComparisonData && comparisonStats?.muscleFocus ? comparisonStats.muscleFocus : undefined}
        />
      ),
      data: stats?.muscleFocus || {}
    },
    {
      title: "Workout Days",
      renderComponent: (data: any) => (
        <WorkoutDaysChart 
          daysFrequency={data} 
          height={250}
          comparisonData={hasComparisonData && comparisonStats?.timePatterns?.daysFrequency 
            ? comparisonStats.timePatterns.daysFrequency 
            : undefined}
        />
      ),
      data: stats?.timePatterns?.daysFrequency || {}
    },
    {
      title: "Time of Day",
      renderComponent: (data: any) => (
        <TimeOfDayChart 
          durationByTimeOfDay={data} 
          height={250}
          comparisonData={hasComparisonData && comparisonStats?.timePatterns?.durationByTimeOfDay 
            ? comparisonStats.timePatterns.durationByTimeOfDay 
            : undefined}
        />
      ),
      data: stats?.timePatterns?.durationByTimeOfDay || {}
    },
    {
      title: "Top Exercises",
      renderComponent: (data: any) => (
        <TopExercisesTable 
          exerciseVolumeHistory={data}
          comparisonData={hasComparisonData && comparisonStats?.exerciseVolumeHistory 
            ? comparisonStats.exerciseVolumeHistory 
            : undefined}
        />
      ),
      data: stats?.exerciseVolumeHistory || []
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {chartConfigs.map(({ title, renderComponent, data }, idx) => (
        <ChartSection key={idx} title={title}>
          {renderComponent(data)}
        </ChartSection>
      ))}
    </div>
  );
};
