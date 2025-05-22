
import React from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

interface MiniTrendChartProps {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}

export const MiniTrendChart: React.FC<MiniTrendChartProps> = ({ 
  data,
  color = "#8B5CF6", // default purple
  height = 30,
  className = ""
}) => {
  // Convert raw data into chart format
  const chartData = data.map((value, index) => ({
    index,
    value
  }));
  
  return (
    <div className={`w-full overflow-hidden ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
