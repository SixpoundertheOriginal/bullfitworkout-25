
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WorkoutVolumeOverTimeChart } from '@/components/metrics/WorkoutVolumeOverTimeChart';
import { VolumeDataPoint } from '@/hooks/useProcessWorkoutMetrics';

interface MainVolumeChartProps {
  data?: VolumeDataPoint[];
  height?: number;
  className?: string;
}

export const MainVolumeChart: React.FC<MainVolumeChartProps> = ({ 
  data = [], 
  height = 300,
  className = ""
}) => {
  return (
    <Card className={`bg-gray-900/80 border-gray-800 shadow-md overflow-hidden ${className}`} style={{ minHeight: `${height + 60}px` }}>
      <CardHeader><CardTitle>Volume Over Time</CardTitle></CardHeader>
      <CardContent className="p-0">
        <WorkoutVolumeOverTimeChart data={data} height={height} />
      </CardContent>
    </Card>
  );
};
