
import React from 'react';
import { VolumeBarChart } from './VolumeBarChart';
import { VolumeStats } from './VolumeStats';
import { ChartHeader } from './ChartHeader';
import { WorkoutVolumeChartProps } from './types';
import { EmptyState } from './EmptyState';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useVolumeChartData } from './useVolumeChartData';
import { useWeightUnit } from '@/context/WeightUnitContext';

export const WorkoutVolumeChart = ({ data = [], className = '', height = 300 }: WorkoutVolumeChartProps) => {
  const { weightUnit } = useWeightUnit();
  const { hasData, formattedData, volumeStats, handleBarClick } = useVolumeChartData(data);
  
  const isEmpty = !hasData || formattedData.length === 0;

  return (
    <Card className={`bg-gray-900/80 border-gray-800 shadow-md ${className}`}>
      <CardHeader className="pb-2">
        <ChartHeader title="Workout Volume Over Time" />
      </CardHeader>
      <CardContent className="pt-2 pb-6">
        {isEmpty ? (
          <EmptyState message="No volume data available" height={height} />
        ) : (
          <>
            <VolumeStats 
              total={volumeStats.total}
              average={volumeStats.average}
              weightUnit={weightUnit}
            />
            <div className="mt-4" style={{ height: `${height}px` }}>
              <VolumeBarChart 
                data={formattedData} 
                height={height}
                weightUnit={weightUnit}
                onBarClick={handleBarClick}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
