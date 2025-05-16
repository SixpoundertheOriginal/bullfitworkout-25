
// src/pages/Overview.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { WeightUnit } from '@/utils/unitConversion';
import { useLayout } from '@/context/LayoutContext';

// Prevent excess renders by defining these outside component
const DEFAULT_DATE_RANGE = { 
  from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
  to: new Date() 
};

const Overview: React.FC = () => {
  console.log('[Overview] Rendering Overview component');
  
  // Make sure filter is visible
  const { setFilterVisible } = useLayout();
  
  // Force filter to be visible on component mount
  useEffect(() => {
    setFilterVisible(true);
  }, [setFilterVisible]);
  
  // Access contexts safely outside of render
  const authContext = useAuth();
  const weightUnitContext = useWeightUnit();
  const dateRangeContext = useDateRange();
  
  // Derive stable values from contexts
  const user = authContext?.user || null;
  
  const weightUnit: WeightUnit = useMemo(() => {
    return (weightUnitContext?.weightUnit === 'kg' || weightUnitContext?.weightUnit === 'lb') 
      ? weightUnitContext.weightUnit 
      : 'kg';
  }, [weightUnitContext?.weightUnit]);
  
  const dateRange = useMemo(() => {
    if (!dateRangeContext?.dateRange) return DEFAULT_DATE_RANGE;
    
    return {
      from: dateRangeContext.dateRange.from || DEFAULT_DATE_RANGE.from,
      to: dateRangeContext.dateRange.to || DEFAULT_DATE_RANGE.to
    };
  }, [dateRangeContext?.dateRange]);
  
  // User weight preferences (with stable defaults)
  const [userWeight, setUserWeight] = useState<number | null>(null);
  const [userWeightUnit, setUserWeightUnit] = useState<string | null>(null);

  // Fetch historical stats with error handling
  const { stats, loading, refetch, workouts } = useWorkoutStats();
  
  console.log('[Overview] Stats loading:', loading, 
    ', Workouts count:', workouts?.length || 0);
  
  // Process raw metrics - memoized to prevent unnecessary recalculation
  const {
    volumeOverTimeData,
    densityOverTimeData,
    volumeStats,
    densityStats,
    hasVolumeData,
    hasDensityData
  } = useProcessWorkoutMetrics(workouts, weightUnit);
  
  console.log('[Overview] Volume data points:', volumeOverTimeData?.length || 0);
  console.log('[Overview] Has volume data:', hasVolumeData);
  console.log('[Overview] Has density data:', hasDensityData);
  
  // Refetch on date range change - now using a useEffect with proper dependencies
  useEffect(() => {
    console.log('[Overview] Date range changed, refetching...');
    refetch();
  }, [dateRange.from, dateRange.to, refetch]);

  // Load user weight prefs
  useEffect(() => {
    const sw = localStorage.getItem('userWeight');
    const su = localStorage.getItem('userWeightUnit');
    if (sw) setUserWeight(Number(sw));
    if (su) setUserWeightUnit(su);
  }, []);

  // Simple data‐exists guard with memoization
  const hasData = useCallback((v: any) => {
    return v != null && 
      ((Array.isArray(v) && v.length > 0) || 
      (typeof v === 'object' && Object.keys(v).length > 0));
  }, []);

  // Chart configurations - memoized to prevent recreation
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

  // Show a complete loading state instead of partial renders
  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Workout Overview</h1>
        </div>
        <Card className="bg-card overflow-hidden">
          <CardHeader><CardTitle>Loading Overview...</CardTitle></CardHeader>
          <CardContent>
            <Skeleton className="w-full h-[300px]" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><CardContent><Skeleton className="w-full h-[100px] mt-4" /></CardContent></Card>
          <Card><CardContent><Skeleton className="w-full h-[100px] mt-4" /></CardContent></Card>
          <Card><CardContent><Skeleton className="w-full h-[100px] mt-4" /></CardContent></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 pb-48">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Workout Overview</h1>
      </div>

      {/* Volume over time - with fixed dimensions */}
      <Card className="bg-card overflow-hidden" style={{ minHeight: '360px' }}>
        <CardHeader><CardTitle>Volume Over Time</CardTitle></CardHeader>
        <CardContent style={{ height: '300px' }}>
          <WorkoutVolumeOverTimeChart data={volumeOverTimeData} height={300} />
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
              <div className="w-full h-full">
                {renderComponent(data)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Density over time - with fixed dimensions and extra margin */}
      <Card className="bg-card overflow-hidden mb-24" style={{ minHeight: '300px' }}>
        <CardHeader><CardTitle>Volume Rate Over Time</CardTitle></CardHeader>
        <CardContent style={{ height: '250px' }}>
          <WorkoutDensityOverTimeChart data={densityOverTimeData} height={250} />
        </CardContent>
      </Card>
    </div>
  );
};

// Memo the component to prevent unnecessary re-renders
export default React.memo(Overview);
