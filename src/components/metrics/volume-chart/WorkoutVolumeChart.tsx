
import React from 'react';
import { VolumeBarChart } from './VolumeBarChart';
import { VolumeStats } from './VolumeStats';
import { ChartHeader } from './ChartHeader';
import { WorkoutVolumeChartProps, VolumeTooltipProps } from './types';
import { EmptyState } from './EmptyState';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useVolumeChartData } from './useVolumeChartData';

export const VolumeTooltip = ({ active, payload }: VolumeTooltipProps) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded p-2 shadow-xl">
      <p className="font-semibold text-sm">{data.dateLabel}</p>
      <p className="text-xs text-gray-400">
        Volume: <span className="text-purple-400 font-medium">{data.volume.toLocaleString()}</span>
      </p>
      <p className="text-xs text-gray-400">
        Sets: <span className="text-blue-400 font-medium">{data.sets}</span>
      </p>
    </div>
  );
};

export const WorkoutVolumeChart = ({ data = [], className = '', height = 300 }: WorkoutVolumeChartProps) => {
  const { chartData, totalVolume, averageVolume, weightUnit } = useVolumeChartData(data);
  
  const isEmpty = !chartData || chartData.length === 0;

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
              total={totalVolume}
              average={averageVolume}
              weightUnit={weightUnit}
            />
            <div className="mt-4" style={{ height: `${height}px` }}>
              <VolumeBarChart 
                data={chartData} 
                height={height}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
