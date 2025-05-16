
import React, { useMemo } from 'react';
import { Dumbbell } from 'lucide-react';
import { useWeightUnit } from '@/context/WeightUnitContext';
import { WeightUnit } from '@/utils/unitConversion';
import { VolumeDataPoint } from '@/hooks/useProcessWorkoutMetrics';
import { WorkoutVolumeChartProps } from './types';
import { useVolumeChartData } from './useVolumeChartData';
import { VolumeBarChart } from './VolumeBarChart';
import { VolumeStats } from './VolumeStats';
import { ChartHeader } from './ChartHeader';
import { EmptyState } from './EmptyState';

const WorkoutVolumeChartComponent: React.FC<WorkoutVolumeChartProps> = ({
  data = [],
  className = '',
  height = 200
}) => {
  // Extract weight unit with error handling
  const defaultUnit: WeightUnit = 'kg';
  const weightUnitContext = useWeightUnit();
  const weightUnit: WeightUnit = 
    (weightUnitContext?.weightUnit === 'kg' || weightUnitContext?.weightUnit === 'lb') 
      ? weightUnitContext.weightUnit 
      : defaultUnit;
  
  // Process chart data
  const { hasData, formattedData, volumeStats, handleBarClick } = useVolumeChartData(data, weightUnit);

  return (
    <div
      className={`bg-gray-900 border-gray-800 hover:border-purple-500/50 transition-all ${className}`}
      style={{ minHeight: `${height + 60}px` }}
    >
      <ChartHeader 
        title="Volume Over Time"
        average={hasData ? volumeStats.average : undefined}
        weightUnit={weightUnit}
      />

      <div className="px-4 pb-4">
        {!hasData ? (
          <EmptyState 
            message="No workout data available for the selected period" 
            height={height} 
          />
        ) : (
          <div style={{ width: '100%', height }} className="flex-1">
            <VolumeBarChart 
              data={formattedData}
              height={height}
              weightUnit={weightUnit}
              onBarClick={handleBarClick}
            />
          </div>
        )}

        {hasData && (
          <VolumeStats 
            total={volumeStats.total}
            average={volumeStats.average}
            weightUnit={weightUnit}
          />
        )}
      </div>
    </div>
  );
};

export const WorkoutVolumeOverTimeChart = React.memo(WorkoutVolumeChartComponent);
WorkoutVolumeOverTimeChart.displayName = 'WorkoutVolumeOverTimeChart';
