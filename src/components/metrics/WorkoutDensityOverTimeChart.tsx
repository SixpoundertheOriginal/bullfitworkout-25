
import React from 'react';
import { Activity } from 'lucide-react';
import { useWeightUnit } from '@/context/WeightUnitContext';
import { WeightUnit } from '@/utils/unitConversion';
import { DensityDataPoint } from '@/hooks/useProcessWorkoutMetrics';
import { ChartContent } from './workout-density/ChartContent';
import { DensitySummary } from './workout-density/DensitySummary';
import { useChartData } from './workout-density/useChartData';

interface WorkoutDensityOverTimeChartProps {
  data?: DensityDataPoint[];
  className?: string;
  height?: number;
}

const WorkoutDensityOverTimeChartComponent: React.FC<WorkoutDensityOverTimeChartProps> = ({
  data = [],
  className = '',
  height = 200
}) => {
  // Extract weight unit with stable typing
  const weightUnitContext = useWeightUnit();
  const weightUnit: WeightUnit = 
    (weightUnitContext?.weightUnit === 'kg' || weightUnitContext?.weightUnit === 'lb') 
      ? weightUnitContext.weightUnit 
      : 'kg';

  // Process chart data using the custom hook
  const { hasData, formattedData, averages } = useChartData(data);

  return (
    <div
      className={`bg-gray-900 border-gray-800 hover:border-purple-500/50 transition-all ${className}`}
      style={{ minHeight: `${height + 80}px` }}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center text-sm text-gray-300">
          <Activity className="h-4 w-4 mr-2 text-purple-400" />
          Workout Density Over Time
        </div>
        {hasData && (
          <div className="text-xs text-gray-400">
            Avg: {averages.overall} {weightUnit}/min
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        <ChartContent 
          data={formattedData} 
          weightUnit={weightUnit} 
          height={height} 
        />

        {hasData && (
          <DensitySummary 
            overall={averages.overall} 
            activeOnly={averages.activeOnly} 
            weightUnit={weightUnit} 
          />
        )}
      </div>
    </div>
  );
};

export const WorkoutDensityOverTimeChart = React.memo(
  WorkoutDensityOverTimeChartComponent
);
WorkoutDensityOverTimeChart.displayName = 'WorkoutDensityOverTimeChart';
