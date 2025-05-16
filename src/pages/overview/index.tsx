
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

const OverviewPage: React.FC = () => {
  const { 
    workouts, 
    loading, 
    isError,
    stats 
  } = useWorkoutStats();

  const processedMetrics = useProcessWorkoutMetrics(workouts || []);
  
  const volumeChartData = useVolumeChartData(processedMetrics as VolumeDataPoint[]);
  const densityChartData = useChartData(processedMetrics as unknown as DensityDataPoint[]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
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
      <OverviewHeader title="Workout Overview" />
      {stats && <KPISection {...kpiData} />}
      <ChartsGrid 
        stats={stats || {}} 
        weightUnit={kpiData.weightUnit}
      />
    </div>
  );
};

export default OverviewPage;
