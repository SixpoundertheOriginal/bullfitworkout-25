
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { VolumeTooltip } from './VolumeTooltip';
import { WeightUnit } from '@/utils/unitConversion';

export interface VolumeBarChartProps {
  data: any[];
  height: number;
  weightUnit: WeightUnit | string;
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
      <BarChart
        data={data}
        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        barCategoryGap="15%"
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis 
          dataKey="date" 
          tick={{ fill: '#9ca3af' }} 
          axisLine={{ stroke: '#374151' }}
          tickLine={{ stroke: '#4b5563' }}
        />
        <YAxis 
          tick={{ fill: '#9ca3af' }} 
          axisLine={{ stroke: '#374151' }}
          tickLine={{ stroke: '#4b5563' }}
          tickFormatter={(value) => `${value}`}
          width={40}
        />
        <Tooltip 
          content={<VolumeTooltip />} 
          cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
        />
        <Bar 
          dataKey="volume" 
          name={`Volume (${weightUnit})`}
          fill="#8b5cf6" 
          radius={[4, 4, 0, 0]}
          onClick={(data) => onBarClick(data)}
          cursor="pointer"
          className="hover:opacity-80 transition-opacity"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
