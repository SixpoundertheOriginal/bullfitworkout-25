
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { WeightUnit } from '@/utils/unitConversion';
import { ChartTooltip } from './ChartTooltip';
import { DensityDataPoint } from '@/hooks/useProcessWorkoutMetrics';

interface ChartContentProps {
  data: any[];
  weightUnit: WeightUnit;
  height: number;
}

export const ChartContent: React.FC<ChartContentProps> = ({
  data,
  weightUnit,
  height
}) => {
  // Render empty state if no data
  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center h-full text-gray-400"
        style={{ height }}
      >
        No density data available for the selected period
      </div>
    );
  }
  
  return (
    <div style={{ width: '100%', height }} className="flex-1">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
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
            content={(props) => <ChartTooltip {...props} weightUnit={weightUnit} />}
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
  );
};
