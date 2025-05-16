
import React, { useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { useDateRange } from '@/context/DateRangeContext';
import { useProcessWorkoutMetrics } from '@/hooks/useProcessWorkoutMetrics';
import { WeightUnit } from '@/utils/unitConversion';
import { useLayout } from '@/context/LayoutContext';

// Import the refactored components
import { OverviewHeader } from './OverviewHeader';
import { MainVolumeChart } from './MainVolumeChart';
import { KPISection } from './KPISection';
import { ChartsGrid } from './ChartsGrid';
import { DensityChart } from './DensityChart';
import { LoadingSkeleton } from './LoadingSkeleton';

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
  
  const weightUnit: WeightUnit = React.useMemo(() => {
    return (weightUnitContext?.weightUnit === 'kg' || weightUnitContext?.weightUnit === 'lb') 
      ? weightUnitContext.weightUnit 
      : 'kg';
  }, [weightUnitContext?.weightUnit]);
  
  const dateRange = React.useMemo(() => {
    if (!dateRangeContext?.dateRange) return DEFAULT_DATE_RANGE;
    
    return {
      from: dateRangeContext.dateRange.from || DEFAULT_DATE_RANGE.from,
      to: dateRangeContext.dateRange.to || DEFAULT_DATE_RANGE.to
    };
  }, [dateRangeContext?.dateRange]);
  
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

  // Show loading skeleton if data is still loading
  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="container mx-auto py-10 px-4 space-y-6 pb-56 mt-4">
      <OverviewHeader title="Workout Overview" />
      
      {/* Volume over time chart */}
      <MainVolumeChart data={volumeOverTimeData} />

      {/* KPI cards section */}
      <KPISection 
        totalWorkouts={stats?.totalWorkouts || 0}
        volumeTotal={volumeStats?.total || 0}
        avgDensity={densityStats?.avgOverallDensity || 0}
        weightUnit={weightUnit}
      />

      {/* Chart grid section */}
      <ChartsGrid stats={stats} weightUnit={weightUnit} />

      {/* Density chart */}
      <DensityChart data={densityOverTimeData} />
    </div>
  );
};

// Memo the component to prevent unnecessary re-renders
export default React.memo(Overview);
