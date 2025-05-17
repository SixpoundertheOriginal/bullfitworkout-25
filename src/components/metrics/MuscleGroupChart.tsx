
import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

interface MuscleGroupChartProps {
  muscleFocus?: Record<string, number>;
  height?: number;
  comparisonData?: Record<string, number>;
}

export const MuscleGroupChart: React.FC<MuscleGroupChartProps> = ({
  muscleFocus = {},
  height = 250,
  comparisonData
}) => {
  // Add safety check for comparison data
  const hasComparison = !!comparisonData && typeof comparisonData === 'object' && comparisonData !== null;
  
  // Transform data for chart display with safety checks
  const chartData = useMemo(() => {
    // Ensure muscleFocus is an object
    const safeFocus = typeof muscleFocus === 'object' && muscleFocus !== null ? muscleFocus : {};
    const muscleGroups = Object.keys(safeFocus);
    
    // Only proceed if we have muscle groups
    if (muscleGroups.length === 0) {
      return [];
    }
    
    return muscleGroups
      .map((muscleGroup) => ({
        name: capitalizeFirstLetter(muscleGroup),
        value: safeFocus[muscleGroup] || 0,
        comparisonValue: hasComparison && comparisonData 
          ? (comparisonData[muscleGroup] || 0) 
          : undefined
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Show top 10
  }, [muscleFocus, comparisonData, hasComparison]);

  // Check for data existence
  const hasData = useMemo(() => 
    typeof muscleFocus === 'object' &&
    muscleFocus !== null &&
    Object.values(muscleFocus).some(value => value > 0),
    [muscleFocus]
  );

  // Helper function for capitalization
  function capitalizeFirstLetter(string: string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Render fallback if no data
  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No muscle focus data available
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <XAxis
            type="number"
            tick={{ fill: '#f9fafb', fontSize: 12 }}
            axisLine={{ stroke: '#374151' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#f9fafb', fontSize: 12 }}
            width={80}
            axisLine={{ stroke: '#374151' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              borderColor: '#374151',
              color: '#f9fafb'
            }}
            cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
            formatter={(value: any) => [`${value} exercises`, 'Count']}
          />
          {hasComparison && (
            <Bar
              dataKey="comparisonValue"
              fill="#6d28d9"
              opacity={0.4}
              name="Previous Period"
              strokeDasharray="3 3"
              radius={[0, 4, 4, 0]}
            />
          )}
          <Bar
            dataKey="value"
            fill="#8b5cf6"
            name="Current Period"
            radius={[0, 4, 4, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
