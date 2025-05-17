
import React from 'react';
import { useDateRange } from '@/context/DateRangeContext';
import { useWorkoutComparisonStats } from '@/hooks/useWorkoutComparisonStats';
import { ComparisonKPI } from '@/components/ui/period-comparison/ComparisonKPI';
import { ComparisonToggle } from '@/components/ui/period-comparison/ComparisonToggle';
import { WeightUnit } from '@/utils/unitConversion';

export interface KPISectionProps {
  totalWorkouts: number;
  volumeTotal: number;
  avgDensity: number;
  weightUnit: WeightUnit | string;
}

export const KPISection: React.FC<KPISectionProps> = ({
  totalWorkouts,
  volumeTotal,
  avgDensity,
  weightUnit
}) => {
  // Access date range context for comparison toggle and ranges
  const { dateRange, comparisonEnabled, comparisonDateRange } = useDateRange();
  
  // Use our new hook to get comparison data if enabled
  const { 
    comparisons, 
    currentMetrics,
    previousMetrics,
    loading: comparisonLoading 
  } = useWorkoutComparisonStats(
    dateRange,
    comparisonEnabled ? comparisonDateRange : undefined,
    weightUnit as WeightUnit
  );

  // Determine which data to use - either direct props or from comparison hook
  const data = React.useMemo(() => {
    if (comparisonEnabled) {
      return {
        totalWorkouts: currentMetrics?.totalWorkouts || 0,
        prevTotalWorkouts: previousMetrics?.totalWorkouts,
        workoutChange: comparisons?.workoutCount?.percentage,
        
        volumeTotal: currentMetrics?.totalVolume || 0,
        prevVolumeTotal: previousMetrics?.totalVolume,
        volumeChange: comparisons?.volume?.percentage,
        
        avgDensity: currentMetrics?.density || 0,
        prevAvgDensity: previousMetrics?.density,
        densityChange: comparisons?.density?.percentage
      };
    } else {
      return {
        totalWorkouts,
        volumeTotal,
        avgDensity
      };
    }
  }, [
    comparisonEnabled, 
    totalWorkouts, volumeTotal, avgDensity,
    currentMetrics, previousMetrics, comparisons
  ]);
  
  // Format the density value for display
  const formattedDensity = typeof data.avgDensity === 'number' && !isNaN(data.avgDensity) 
    ? data.avgDensity.toFixed(1) 
    : "0.0";
  
  const formattedPrevDensity = typeof data.prevAvgDensity === 'number' && !isNaN(data.prevAvgDensity)
    ? data.prevAvgDensity.toFixed(1)
    : undefined;

  return (
    <div className="space-y-4">
      {/* Comparison Toggle without date selector since it's already in the header */}
      <ComparisonToggle className="mb-2" showDateSelector={false} />
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ComparisonKPI
          title="Total Workouts"
          value={data.totalWorkouts || 0}
          previousValue={data.prevTotalWorkouts}
          percentChange={data.workoutChange}
          isLoading={comparisonEnabled && comparisonLoading}
          direction="up-good"
        />
        
        <ComparisonKPI
          title="Total Volume"
          value={`${Math.round(data.volumeTotal || 0).toLocaleString()} ${weightUnit}`}
          previousValue={data.prevVolumeTotal ? 
            `${Math.round(data.prevVolumeTotal).toLocaleString()} ${weightUnit}` : 
            undefined}
          percentChange={data.volumeChange}
          isLoading={comparisonEnabled && comparisonLoading}
          direction="up-good"
        />
        
        <ComparisonKPI
          title="Avg Volume Rate"
          value={`${formattedDensity} ${weightUnit}/min`}
          previousValue={formattedPrevDensity ? 
            `${formattedPrevDensity} ${weightUnit}/min` : 
            undefined}
          percentChange={data.densityChange}
          isLoading={comparisonEnabled && comparisonLoading}
          direction="up-good"
        />
      </div>
    </div>
  );
}
