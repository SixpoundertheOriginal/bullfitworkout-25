
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WorkoutVolumeOverTimeChart } from '@/components/metrics/WorkoutVolumeOverTimeChart';
import { VolumeDataPoint } from '@/hooks/useProcessWorkoutMetrics';
import { useDateRange } from '@/context/DateRangeContext';
import { format } from 'date-fns';

interface MainVolumeChartProps {
  data?: VolumeDataPoint[];
  height?: number;
  className?: string;
  comparisonData?: VolumeDataPoint[];
}

export const MainVolumeChart: React.FC<MainVolumeChartProps> = ({ 
  data = [], 
  height = 300,
  className = "",
  comparisonData
}) => {
  const { comparisonEnabled, comparisonDateRange } = useDateRange();
  
  // Format the comparison period text if enabled
  const comparisonPeriodText = React.useMemo(() => {
    if (!comparisonEnabled || !comparisonDateRange?.from || !comparisonDateRange?.to) {
      return null;
    }
    
    return `vs. ${format(comparisonDateRange.from, 'MMM d')} - ${format(comparisonDateRange.to, 'MMM d')}`;
  }, [comparisonEnabled, comparisonDateRange]);

  return (
    <Card className={`bg-gray-900/80 border-gray-800 shadow-md overflow-hidden ${className}`} style={{ minHeight: `${height + 60}px` }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Volume Over Time</CardTitle>
          {comparisonPeriodText && (
            <span className="text-xs text-gray-400">{comparisonPeriodText}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <WorkoutVolumeOverTimeChart 
          data={data} 
          height={height} 
          comparisonData={comparisonEnabled ? comparisonData : undefined} 
        />
      </CardContent>
    </Card>
  );
};
