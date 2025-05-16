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

const OverviewPage: React.FC = () => {
  // Keep using the existing hook for overall data
  const { 
    workouts, 
    loading, 
    stats 
  } = useWorkoutStats();

  // Log the raw data for debugging
  console.log("[OverviewPage] Raw workouts:", workouts?.length);
  console.log("[OverviewPage] Stats:", stats);

  const processedMetrics = useProcessWorkoutMetrics(workouts || []);
  
  // Log the processed metrics to debug density calculation
  console.log("[OverviewPage] Processed metrics:", processedMetrics);
  
  const volumeChartData = useVolumeChartData(processedMetrics as VolumeDataPoint[]);
  const densityChartData = useChartData(processedMetrics as unknown as DensityDataPoint[]);

  // Log the chart data results
  console.log("[OverviewPage] Volume chart data:", volumeChartData);
  console.log("[OverviewPage] Density chart data:", densityChartData);

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

  // Log the density value being used
  console.log("[OverviewPage] Density value for KPI:", densityStats.average);

  // Prepare data for KPI section
  const kpiData = {
    totalWorkouts: stats?.totalWorkouts || 0,
    volumeTotal: volumeChartData.volumeStats?.total || 0,
    avgDensity: densityStats.average,
    weightUnit: "kg" as WeightUnit
  };

  return (
    <div className="container py-6">
      <OverviewHeader title="Workout Overview" />
      {stats && <KPISection {...kpiData} />}
      
      {/* Main Volume Chart - Restored */}
      <MainVolumeChart 
        data={processedMetrics as VolumeDataPoint[]} 
        height={350}
        className="mb-6"
      />
      
      <ChartsGrid 
        stats={stats || {}} 
        weightUnit={kpiData.weightUnit}
      />
    </div>
  );
};

export default OverviewPage;
