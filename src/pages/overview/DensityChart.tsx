
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WorkoutDensityOverTimeChart } from '@/components/metrics/WorkoutDensityOverTimeChart';
import { DensityDataPoint } from '@/hooks/useProcessWorkoutMetrics';

interface DensityChartProps {
  data?: DensityDataPoint[];
  height?: number;
}

export const DensityChart: React.FC<DensityChartProps> = ({ 
  data = [], 
  height = 250 
}) => {
  return (
    <Card className="bg-card overflow-hidden mb-24" style={{ minHeight: `${height + 50}px` }}>
      <CardHeader><CardTitle>Volume Rate Over Time</CardTitle></CardHeader>
      <CardContent style={{ height: `${height}px` }}>
        <WorkoutDensityOverTimeChart data={data} height={height} />
      </CardContent>
    </Card>
  );
};
