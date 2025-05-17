import React from 'react';
import { OverviewHeader } from './OverviewHeader';
import { ChartsGrid } from './ChartsGrid';
import { KPISection } from './KPISection';
import { LoadingSkeleton } from './LoadingSkeleton';
import { useWorkoutStats } from '@/hooks/useWorkoutStats';
import { useProcessWorkoutMetrics } from '@/hooks/useProcessWorkoutMetrics';
import { useVolumeChartData } from '@/components/metrics/volume-chart/useVolumeChartData';
import { useChartData } from '@/components/metrics/workout-density/useChartData';
import { VolumeDataPoint, DensityDataPoint } from '@/hooks/useProcessWorkoutMetrics';
import { WeightUnit } from '@/utils/unitConversion';
import { MainVolumeChart } from './MainVolumeChart';
import { useDateRange } from '@/context/DateRangeContext';
import { useWorkoutComparisonStats } from '@/hooks/useWorkoutComparisonStats';
import { ComparisonToggle } from '@/components/ui/period-comparison/ComparisonToggle';

const OverviewPage: React.FC = () => {
  // Access date range context to get current and comparison date ranges
  const { 
    dateRange, 
    comparisonEnabled, 
    comparisonDateRange 
  } = useDateRange();

  // Keep using the existing hook for overall data
  const { 
    workouts, 
    loading, 
    stats 
  } = useWorkoutStats();

  // Get comparison data if enabled
  const {
    currentWorkouts,
    previousWorkouts,
    loading: comparisonLoading
  } = useWorkoutComparisonStats(
    dateRange,
    comparisonEnabled ? comparisonDateRange : undefined,
    "kg" as WeightUnit
  );

  // Log the raw data for debugging
  console.log("[OverviewPage] Raw workouts:", workouts?.length);
  console.log("[OverviewPage] Stats:", stats);
  console.log("[OverviewPage] Comparison enabled:", comparisonEnabled);
  console.log("[OverviewPage] Comparison data:", previousWorkouts?.length);

  // Process metrics for current period
  const processedMetrics = useProcessWorkoutMetrics(workouts || []);
  
  // Process metrics for comparison period if enabled
  const comparisonMetrics = React.useMemo(() => {
    if (!comparisonEnabled || !previousWorkouts) return undefined;
    return useProcessWorkoutMetrics(previousWorkouts);
  }, [comparisonEnabled, previousWorkouts]);
  
  // Log the processed metrics to debug density calculation
  console.log("[OverviewPage] Processed metrics:", processedMetrics);
  console.log("[OverviewPage] Comparison metrics:", comparisonMetrics);
  
  // Chart data for both current and comparison periods
  const volumeChartData = useVolumeChartData(processedMetrics as VolumeDataPoint[]);
  const densityChartData = useChartData(processedMetrics as unknown as DensityDataPoint[]);
  
  // Chart data for comparison period
  const comparisonVolumeChartData = React.useMemo(() => {
    if (!comparisonEnabled || !comparisonMetrics) return undefined;
    return useVolumeChartData(comparisonMetrics as VolumeDataPoint[]);
  }, [comparisonEnabled, comparisonMetrics]);

  // Log the chart data results
  console.log("[OverviewPage] Volume chart data:", volumeChartData);
  console.log("[OverviewPage] Density chart data:", densityChartData);
  console.log("[OverviewPage] Comparison volume data:", comparisonVolumeChartData);

  if (loading) {
    return <LoadingSkeleton />;
  }

  // Check if we have valid stats and data - if not, show error state
  if (!stats || !workouts || workouts.length === 0) {
    return (
      <div className="container py-6">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
          <p className="text-gray-400">Failed to load workout data</p>
        </div>
      </div>
    );
  }

  // Get density stats from the averages property
  const densityStats = {
    average: densityChartData.averages?.overall || 0
  };

  // Prepare data for KPI section
  const kpiData = {
    totalWorkouts: stats?.totalWorkouts || 0,
    volumeTotal: volumeChartData.volumeStats?.total || 0,
    avgDensity: densityStats.average,
    weightUnit: "kg" as WeightUnit
  };

  return (
    <div className="container py-6">
      <OverviewHeader title="Workout Overview">
        <ComparisonToggle showDateSelector={true} className="mt-2" />
      </OverviewHeader>
      
      {stats && <KPISection {...kpiData} />}
      
      {/* Main Volume Chart - With Comparison Support */}
      <MainVolumeChart 
        data={processedMetrics as VolumeDataPoint[]} 
        comparisonData={comparisonMetrics as VolumeDataPoint[]}
        height={350}
        className="mb-6"
      />
      
      {/* Charts Grid - Pass both current and comparison data */}
      <ChartsGrid 
        stats={stats || {}}
        weightUnit={kpiData.weightUnit}
        comparisonStats={comparisonEnabled ? {
          volumeData: comparisonVolumeChartData,
          workouts: previousWorkouts
        } : undefined}
      />
    </div>
  );
};

export default OverviewPage;
