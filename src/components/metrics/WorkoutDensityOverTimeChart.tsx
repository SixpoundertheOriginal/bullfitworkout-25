
// src/components/metrics/WorkoutDensityOverTimeChart.tsx

import React, { useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';
import { useWeightUnit } from '@/context/WeightUnitContext';
import { WeightUnit } from '@/utils/unitConversion';
import { DensityDataPoint } from '@/hooks/useProcessWorkoutMetrics';

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

  // Determine if there's valid density data - moved out of render and memoized
  const hasData = useMemo(
    () =>
      Array.isArray(data) &&
      data.length > 0 &&
      data.some(item => item && typeof item.overallDensity === 'number' && item.overallDensity > 0),
    [data]
  );

  // Memoize formatted data for the chart
  const formattedData = useMemo(() => {
    if (!hasData) return [];
    
    return data
      .filter(item => item && typeof item === 'object')
      .map(item => {
        // Always provide safe defaults
        const safeItem = {
          date: item?.date || new Date().toISOString(),
          overallDensity: typeof item?.overallDensity === 'number' ? Number(item.overallDensity.toFixed(1)) : 0,
          activeOnlyDensity: typeof item?.activeOnlyDensity === 'number' ? Number(item.activeOnlyDensity.toFixed(1)) : undefined
        };
        
        return {
          date: format(new Date(safeItem.date), 'MMM d'),
          overallDensity: safeItem.overallDensity,
          activeOnlyDensity: safeItem.activeOnlyDensity,
          originalDate: safeItem.date
        };
      });
  }, [data, hasData]);

  // Memoize average densities
  const averages = useMemo(() => {
    if (!hasData) return { overall: 0, activeOnly: 0 };
    
    // Use safer calculations with type checking
    const validItems = data.filter(item => 
      item && typeof item.overallDensity === 'number' && !isNaN(item.overallDensity)
    );
    
    const sumOverall = validItems.reduce((acc, item) => acc + item.overallDensity, 0);
    const overall = validItems.length > 0 ? Number((sumOverall / validItems.length).toFixed(1)) : 0;
    
    const validActive = validItems.filter(item => 
      typeof item.activeOnlyDensity === 'number' && !isNaN(item.activeOnlyDensity)
    );
    
    const activeOnly = validActive.length > 0
      ? Number((validActive.reduce((acc, item) => acc + item.activeOnlyDensity!, 0) / validActive.length).toFixed(1))
      : 0;
      
    return { overall, activeOnly };
  }, [data, hasData]);

  // Custom tooltip content with memoization
  const renderTooltipContent = useCallback(({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div className="bg-gray-800 border border-gray-700 p-2 rounded-lg shadow-lg">
        <p className="text-gray-300">
          {format(new Date(payload[0].payload.originalDate), 'MMM d, yyyy')}
        </p>
        <p className="text-purple-400 font-semibold">
          Overall: {payload[0].value} {weightUnit}/min
        </p>
        {payload[1] && payload[1].value !== undefined && (
          <p className="text-blue-400 font-semibold">
            Active Only: {payload[1].value} {weightUnit}/min
          </p>
        )}
      </div>
    );
  }, [weightUnit]);

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
        {!hasData ? (
          <div
            className="flex items-center justify-center h-full text-gray-400"
            style={{ height }}
          >
            No density data available for the selected period
          </div>
        ) : (
          <div style={{ width: '100%', height }} className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={formattedData}
                margin={{ top: 5, right: 5, left: 5, bottom: 30 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#333333"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#888888', fontSize: 12 }}
                  axisLine={{ stroke: '#333333' }}
                  tickLine={{ stroke: '#333333' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fill: '#888888', fontSize: 12 }}
                  axisLine={{ stroke: '#333333' }}
                  tickLine={{ stroke: '#333333' }}
                  width={50}
                  label={{
                    value: `Density (${weightUnit}/min)`,
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#888888',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <Tooltip
                  content={renderTooltipContent}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="overallDensity"
                  stroke="#9B87F5"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#9B87F5" }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="activeOnlyDensity"
                  stroke="#0EA5E9"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#0EA5E9" }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {hasData && (
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400 mb-1">Overall Density</p>
              <p className="text-lg font-semibold text-purple-400">
                {averages.overall}{' '}
                <span className="text-sm text-gray-400">{weightUnit}/min</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Active Density</p>
              <p className="text-lg font-semibold text-blue-400">
                {averages.activeOnly}{' '}
                <span className="text-sm text-gray-400">{weightUnit}/min</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const WorkoutDensityOverTimeChart = React.memo(
  WorkoutDensityOverTimeChartComponent
);
WorkoutDensityOverTimeChart.displayName = 'WorkoutDensityOverTimeChart';
