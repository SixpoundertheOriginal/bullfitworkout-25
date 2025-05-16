
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { VolumeTooltip } from './VolumeTooltip';
import { WeightUnit } from '@/utils/unitConversion';

interface VolumeBarChartProps {
  data: any[];
  height: number;
  weightUnit: WeightUnit;
  onBarClick: (data: any) => void;
}

export const VolumeBarChart: React.FC<VolumeBarChartProps> = ({
  data,
  height,
  weightUnit,
  onBarClick
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
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
          content={<VolumeTooltip />}
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
          onClick={onBarClick}
          cursor="pointer"
          className="hover:opacity-80 transition-opacity"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
