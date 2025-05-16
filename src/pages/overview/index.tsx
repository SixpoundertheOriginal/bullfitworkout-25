
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

const OverviewPage: React.FC = () => {
  const { 
    workouts, 
    loading, 
    error,
    stats 
  } = useWorkoutStats();

  const processedMetrics = useProcessWorkoutMetrics(workouts || []);
  
  const volumeChartData = useVolumeChartData(processedMetrics as VolumeDataPoint[]);
  const densityChartData = useChartData(processedMetrics as unknown as DensityDataPoint[]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="container py-6">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // Manually construct the data structure with proper types
  const overviewData = {
    volumeOverTimeData: volumeChartData.formattedData || [],
    densityOverTimeData: densityChartData.formattedData || [],
    volumeStats: volumeChartData.volumeStats || { total: 0, average: 0 },
    densityStats: densityChartData.densityStats || { average: 0 },
    hasVolumeData: volumeChartData.hasData || false,
    hasDensityData: densityChartData.hasData || false,
    handleBarClick: volumeChartData.handleBarClick
  };

  return (
    <div className="container py-6">
      <OverviewHeader />
      {stats && <KPISection stats={stats} />}
      <ChartsGrid data={overviewData} />
    </div>
  );
};

export default OverviewPage;
