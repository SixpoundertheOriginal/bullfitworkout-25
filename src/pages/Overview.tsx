
// src/pages/Overview.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { Users2, Flame, Activity } from "lucide-react";
import { WorkoutTypeChart } from "@/components/metrics/WorkoutTypeChart";
import { MuscleGroupChart } from "@/components/metrics/MuscleGroupChart";
import { TimeOfDayChart } from "@/components/metrics/TimeOfDayChart";
import { WorkoutDaysChart } from "@/components/metrics/WorkoutDaysChart";
import { TopExercisesTable } from "@/components/metrics/TopExercisesTable";
import { WorkoutVolumeOverTimeChart } from '@/components/metrics/WorkoutVolumeOverTimeChart';
import { WorkoutDensityOverTimeChart } from '@/components/metrics/WorkoutDensityOverTimeChart';
import { useWeightUnit } from "@/context/WeightUnitContext";
import { useDateRange } from '@/context/DateRangeContext';
import { useProcessWorkoutMetrics } from '@/hooks/useProcessWorkoutMetrics';

const Overview: React.FC = () => {
  // Access contexts safely with fallbacks
  let weightUnit = 'kg';
  let dateRange = { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() };
  let user = null;
  
  try {
    const weightUnitContext = useWeightUnit();
    weightUnit = weightUnitContext?.weightUnit || 'kg';
  } catch (error) {
    console.error("Error accessing weight unit context:", error);
  }

  try {
    const dateRangeContext = useDateRange();
    dateRange = dateRangeContext?.dateRange || dateRange;
  } catch (error) {
    console.error("Error accessing date range context:", error);
  }

  try {
    const authContext = useAuth();
    user = authContext?.user;
  } catch (error) {
    console.error("Error accessing auth context:", error);
  }
  
  const [userWeight, setUserWeight] = useState<number | null>(null);
  const [userWeightUnit, setUserWeightUnit] = useState<string | null>(null);

  // Fetch historical stats with error handling
  const { stats, loading, refetch, workouts } = useWorkoutStats();
  
  // Add console log for debugging
  console.log('[Overview] Stats loading:', loading, ', Workouts length:', workouts?.length);
  
  // Process raw metrics - memoized to prevent unnecessary recalculation
  const {
    volumeOverTimeData,
    densityOverTimeData,
    volumeStats,
    densityStats
  } = useProcessWorkoutMetrics(workouts, weightUnit);
  
  console.log('[Overview] Volume data points:', volumeOverTimeData?.length);
  
  // Refetch on date range change
  useEffect(() => {
    if (dateRange) refetch();
  }, [dateRange, refetch]);

  // Load user weight prefs
  useEffect(() => {
    const sw = localStorage.getItem('userWeight');
    const su = localStorage.getItem('userWeightUnit');
    if (sw) setUserWeight(Number(sw));
    if (su) setUserWeightUnit(su);
  }, []);

  // Simple data‐exists guard
  const hasData = (v: any) => v != null && ((Array.isArray(v) && v.length > 0) || (typeof v === 'object' && Object.keys(v).length > 0));

  // Chart configurations (excluding density gauge) - memoized to prevent recreation
  const chartConfigs = useMemo(() => ([
    {
      title: "Workout Types",
      renderComponent: (data: any) => <WorkoutTypeChart workoutTypes={data} height={250} />,
      data: stats.workoutTypes || []
    },
    {
      title: "Muscle Focus",
      renderComponent: (data: any) => <MuscleGroupChart muscleFocus={data} height={250} />,
      data: stats.muscleFocus || {}
    },
    {
      title: "Workout Days",
      renderComponent: (data: any) => <WorkoutDaysChart daysFrequency={data} height={250} />,
      data: stats.timePatterns?.daysFrequency || {}
    },
    {
      title: "Time of Day",
      renderComponent: (data: any) => <TimeOfDayChart durationByTimeOfDay={data} height={250} />,
      data: stats.timePatterns?.durationByTimeOfDay || {}
    },
    {
      title: "Top Exercises",
      renderComponent: (data: any) => <TopExercisesTable exerciseVolumeHistory={data} />,
      data: stats.exerciseVolumeHistory || []
    }
  ]), [stats, weightUnit]);

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Workout Overview</h1>
      </div>

      {/* Volume over time - with fixed dimensions */}
      <Card className="bg-card overflow-hidden" style={{ minHeight: '360px' }}>
        <CardHeader><CardTitle>Volume Over Time</CardTitle></CardHeader>
        <CardContent style={{ height: '300px' }}>
          {loading ? (
            <Skeleton className="w-full h-full" />
          ) : hasData(volumeOverTimeData) ? (
            <div className="w-full h-full">
              <WorkoutVolumeOverTimeChart data={volumeOverTimeData} height={300} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No volume data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader><CardTitle>Total Workouts</CardTitle></CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats?.totalWorkouts || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader><CardTitle>Total Volume</CardTitle></CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {Math.round(volumeStats?.total || 0).toLocaleString()} {weightUnit}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader><CardTitle>Avg Volume Rate</CardTitle></CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {(densityStats?.avgOverallDensity || 0).toFixed(1)} {weightUnit}/min
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Other charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {chartConfigs.map(({ title, renderComponent, data }, idx) => (
          <Card key={idx} className="bg-gray-900 border-gray-800 overflow-hidden" style={{ minHeight: '300px' }}>
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent style={{ height: '250px' }} className="flex items-center justify-center">
              {loading ? (
                <Skeleton className="w-3/4 h-3/4 rounded-lg" />
              ) : hasData(data) ? (
                <div className="w-full h-full">
                  {renderComponent(data)}
                </div>
              ) : (
                <div className="text-gray-500">No data available</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Density over time - with fixed dimensions */}
      <Card className="bg-card overflow-hidden" style={{ minHeight: '300px' }}>
        <CardHeader><CardTitle>Volume Rate Over Time</CardTitle></CardHeader>
        <CardContent style={{ height: '250px' }}>
          {loading ? (
            <Skeleton className="w-full h-full" />
          ) : hasData(densityOverTimeData) ? (
            <div className="w-full h-full">
              <WorkoutDensityOverTimeChart data={densityOverTimeData} height={250} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">No density data available</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(Overview);
