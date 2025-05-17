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
import { DateRangeFilter } from '@/components/date-filters/DateRangeFilter';

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

  // Ensure we have arrays to work with
  const safeWorkouts = Array.isArray(workouts) ? workouts : [];
  const safePreviousWorkouts = Array.isArray(previousWorkouts) ? previousWorkouts : [];
  
  // Process metrics for current period
  const processedMetrics = useProcessWorkoutMetrics(safeWorkouts);
  
  // Process metrics for comparison period
  const comparisonMetrics = useProcessWorkoutMetrics(
    comparisonEnabled && safePreviousWorkouts.length > 0 ? safePreviousWorkouts : []
  );
  
  // Chart data for current period - always call hooks unconditionally
  const volumeChartData = useVolumeChartData(processedMetrics || []);
  const densityChartData = useChartData(processedMetrics as unknown as DensityDataPoint[]);
  
  // Chart data for comparison period - always call hooks unconditionally
  const comparisonVolumeChartData = useVolumeChartData(
    comparisonEnabled && comparisonMetrics && comparisonMetrics.length > 0 
      ? comparisonMetrics 
      : []
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  // Check if we have valid stats and data - if not, show error state
  if (!stats) {
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
    average: densityChartData?.averages?.overall || 0
  };

  // Prepare data for KPI section
  const kpiData = {
    totalWorkouts: stats?.totalWorkouts || 0,
    volumeTotal: volumeChartData?.volumeStats?.total || 0,
    avgDensity: densityStats.average,
    weightUnit: "kg" as WeightUnit
  };

  // Prepare safe comparison stats object
  const safeComparisonStats = comparisonEnabled ? {
    volumeData: comparisonVolumeChartData,
    workouts: safePreviousWorkouts,
    timePatterns: stats?.timePatterns,
    muscleFocus: stats?.muscleFocus,
    exerciseVolumeHistory: stats?.exerciseVolumeHistory
  } : undefined;

  return (
    <div className="container py-6">
      <OverviewHeader title="Workout Overview">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-2">
          <div className="md:order-1">
            <DateRangeFilter />
          </div>
        </div>
      </OverviewHeader>
      
      {/* KPI Section - with unified comparison toggle */}
      {stats && <KPISection {...kpiData} />}
      
      {/* Main Volume Chart - With Comparison Support */}
      <MainVolumeChart 
        data={processedMetrics} 
        comparisonData={comparisonEnabled ? comparisonMetrics : undefined}
        height={350}
        className="mb-6"
      />
      
      {/* Charts Grid - Pass both current and comparison data */}
      <ChartsGrid 
        stats={stats || {}}
        weightUnit={kpiData.weightUnit}
        comparisonStats={safeComparisonStats}
      />
    </div>
  );
};

export default OverviewPage;
