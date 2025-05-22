import React from 'react';
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
import { EnhancedHeader } from './EnhancedHeader';
import { PersonalRecordsSection } from '@/components/metrics/PersonalRecordsSection';
import { WorkoutBalanceChart } from '@/components/metrics/WorkoutBalanceChart';
import { TrainingQualityScore } from '@/components/metrics/TrainingQualityScore';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { useWorkoutBalance } from '@/hooks/useWorkoutBalance';
import { useTrainingQuality } from '@/hooks/useTrainingQuality';

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
  
  // Chart data for current period
  const volumeChartData = useVolumeChartData(processedMetrics || []);
  const densityChartData = useChartData(processedMetrics as unknown as DensityDataPoint[]);
  
  // Chart data for comparison period
  const comparisonVolumeChartData = useVolumeChartData(
    comparisonEnabled && comparisonMetrics && comparisonMetrics.length > 0 
      ? comparisonMetrics 
      : []
  );

  // Get personal records
  const { records: personalRecords, loading: recordsLoading } = usePersonalRecords();
  
  // Get workout balance data
  const { data: balanceData, loading: balanceLoading } = useWorkoutBalance();
  
  // Get training quality score
  const { score, previousScore, loading: qualityLoading } = useTrainingQuality();

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

  // Prepare data for header - fixing the property names to match what EnhancedHeader expects
  const headerStats = {
    totalWorkouts: stats?.totalWorkouts || 0,
    totalVolume: volumeChartData?.volumeStats?.total || 0,
    avgDuration: stats?.avgDuration || 0
  };

  // Prepare data for KPI section (keep the original property names for KPI section)
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
      {/* Enhanced Header with Period Summary - Now with correct property names */}
      <EnhancedHeader 
        title="Workout Overview" 
        stats={headerStats}
      />
      
      {/* KPI Section */}
      {stats && <KPISection {...kpiData} />}
      
      {/* Main Volume Chart - With Comparison Support */}
      <MainVolumeChart 
        data={processedMetrics} 
        comparisonData={comparisonEnabled ? comparisonMetrics : undefined}
        height={350}
        className="mb-6"
      />
      
      {/* New Metrics Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Training Quality Score */}
        <TrainingQualityScore 
          score={score} 
          previousScore={previousScore}
        />
        
        {/* Personal Records Section */}
        <PersonalRecordsSection records={personalRecords} />
        
        {/* Workout Balance Chart */}
        <WorkoutBalanceChart data={balanceData} />
      </div>
      
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
