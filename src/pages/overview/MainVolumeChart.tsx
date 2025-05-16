
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WorkoutVolumeOverTimeChart } from '@/components/metrics/WorkoutVolumeOverTimeChart';
import { VolumeDataPoint } from '@/hooks/useProcessWorkoutMetrics';

interface MainVolumeChartProps {
  data?: VolumeDataPoint[];
  height?: number;
}

export const MainVolumeChart: React.FC<MainVolumeChartProps> = ({ 
  data = [], 
  height = 300 
}) => {
  return (
    <Card className="bg-card overflow-hidden" style={{ minHeight: `${height + 60}px` }}>
      <CardHeader><CardTitle>Volume Over Time</CardTitle></CardHeader>
      <CardContent style={{ height: `${height}px` }}>
        <WorkoutVolumeOverTimeChart data={data} height={height} />
      </CardContent>
    </Card>
  );
};
