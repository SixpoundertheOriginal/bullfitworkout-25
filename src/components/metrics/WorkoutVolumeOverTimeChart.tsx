
// src/components/metrics/WorkoutVolumeOverTimeChart.tsx

import React, { useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { format } from 'date-fns';
import { Dumbbell } from 'lucide-react';
import { useWeightUnit } from '@/context/WeightUnitContext';
import { convertWeight, WeightUnit } from '@/utils/unitConversion';
import { VolumeDataPoint } from '@/hooks/useProcessWorkoutMetrics';

interface WorkoutVolumeOverTimeChartProps {
  data?: VolumeDataPoint[];
  className?: string;
  height?: number;
}

const WorkoutVolumeOverTimeChartComponent: React.FC<WorkoutVolumeOverTimeChartProps> = ({
  data = [],
  className = '',
  height = 200
}) => {
  // Extract weight unit with error handling - moved to the top level
  // and guaranteed to be the correct type
  const defaultUnit: WeightUnit = 'kg';
  const weightUnitContext = useWeightUnit();
  const weightUnit: WeightUnit = 
    (weightUnitContext?.weightUnit === 'kg' || weightUnitContext?.weightUnit === 'lb') 
      ? weightUnitContext.weightUnit 
      : defaultUnit;
  
  // Check for valid data once, and memoize the result
  const hasData = useMemo(() => 
    Array.isArray(data) && data.length > 0 && data.some(item => item && typeof item.volume === 'number' && item.volume > 0),
    [data]
  );
  
  // Memoize formatted data for the chart
  const formattedData = useMemo(() => {
    if (!hasData) return [];
    
    // More defensive data transformation
    return data
      .filter(item => item && typeof item === 'object')
      .map(item => {
        // Always provide safe defaults
        const safeItem = {
          date: item?.date || new Date().toISOString(),
          volume: typeof item?.volume === 'number' ? item.volume : 0,
        };
        
        return {
          date: format(new Date(safeItem.date), 'MMM d'),
          volume: safeItem.volume,
          originalDate: safeItem.date,
          formattedValue: `${safeItem.volume.toLocaleString()} ${weightUnit}`
        };
      });
  }, [data, weightUnit, hasData]);
  
  // Memoize volume stats calculations
  const volumeStats = useMemo(() => {
    if (!hasData) return { total: 0, average: 0 };
    
    const validVolumes = formattedData.map(d => d.volume).filter(v => !isNaN(v));
    const total = validVolumes.reduce((sum, vol) => sum + vol, 0);
    const average = validVolumes.length > 0 ? total / validVolumes.length : 0;
    
    return { total, average };
  }, [formattedData, hasData]);

  // Custom tooltip content with memoization
  const renderTooltipContent = useCallback(({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div className="bg-gray-800 border border-gray-700 p-2 rounded-lg shadow-lg">
        <p className="text-gray-300">
          {format(new Date(payload[0].payload.originalDate), 'MMM d, yyyy')}
        </p>
        <p className="text-purple-400 font-semibold">
          {payload[0].payload.formattedValue}
        </p>
      </div>
    );
  }, []);

  return (
    <div
      className={`bg-gray-900 border-gray-800 hover:border-purple-500/50 transition-all ${className}`}
      style={{ minHeight: `${height + 60}px` }}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center text-sm text-gray-300">
          <Dumbbell className="h-4 w-4 mr-2 text-purple-400" />
          Volume Over Time
        </div>
        {hasData && (
          <div className="text-xs text-gray-400">
            Avg: {Math.round(volumeStats.average).toLocaleString()} {weightUnit}
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        {!hasData ? (
          <div className="flex items-center justify-center h-full text-gray-400" style={{ height }}>
            No workout data available for the selected period
          </div>
        ) : (
          <div style={{ width: '100%', height }} className="flex-1">
            <ResponsiveContainer width="100%" height={height}>
              <BarChart data={formattedData} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#888888', fontSize: 12 }}
                  axisLine={{ stroke: '#333333' }}
                  tickLine={{ stroke: '#333333' }}
                  angle={-45}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fill: '#888888', fontSize: 12 }}
                  axisLine={{ stroke: '#333333' }}
                  tickLine={{ stroke: '#333333' }}
                  width={50}
                  label={{
                    value: `Volume (${weightUnit})`,
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
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9B87F5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#D946EF" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <Bar 
                  dataKey="volume" 
                  fill="url(#volumeGradient)" 
                  radius={[4, 4, 0, 0]} 
                  isAnimationActive={false} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {hasData && (
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400 mb-1">Total Volume</p>
              <p className="text-lg font-semibold text-purple-400">
                {Math.round(volumeStats.total).toLocaleString()}{' '}
                <span className="text-sm text-gray-400">{weightUnit}</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Average Volume</p>
              <p className="text-lg font-semibold text-blue-400">
                {Math.round(volumeStats.average).toLocaleString()}{' '}
                <span className="text-sm text-gray-400">{weightUnit}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const WorkoutVolumeOverTimeChart = React.memo(WorkoutVolumeOverTimeChartComponent);
WorkoutVolumeOverTimeChart.displayName = 'WorkoutVolumeOverTimeChart';
