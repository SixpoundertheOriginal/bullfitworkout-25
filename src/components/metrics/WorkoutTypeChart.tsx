
import React, { useMemo, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useDateRange } from '@/context/DateRangeContext';

interface WorkoutTypeData {
  type: string;
  count: number;
  totalDuration?: number;
  percentage?: number;
  timeOfDay?: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  averageDuration?: number;
}

interface WorkoutTypeChartProps {
  workoutTypes?: WorkoutTypeData[];
  comparisonData?: WorkoutTypeData[];
  height?: number;
}

const WorkoutTypeChartComponent: React.FC<WorkoutTypeChartProps> = ({
  workoutTypes = [],
  comparisonData = [],
  height = 250
}) => {
  // Access comparison context
  const { comparisonEnabled } = useDateRange();
  const showComparison = comparisonEnabled && comparisonData && comparisonData.length > 0;
  
  // Color palette
  const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  const COMPARISON_COLORS = ['#6D40E8', '#D534AC', '#2563EB', '#059669', '#D97706', '#DC2626'];
  
  // memoize mapping to avoid unnecessary recalculations
  const chartData = useMemo(
    () =>
      workoutTypes.map((item, index) => ({
        name: item.type,
        value: item.count,
        color: COLORS[index % COLORS.length],
        isComparison: false
      })),
    [workoutTypes]
  );
  
  // Prepare comparison data if enabled
  const comparisonChartData = useMemo(
    () => showComparison ?
      comparisonData.map((item, index) => ({
        name: item.type,
        value: item.count,
        color: COMPARISON_COLORS[index % COMPARISON_COLORS.length],
        isComparison: true
      })) : [],
    [showComparison, comparisonData]
  );
  
  // Add a flag to indicate comparison data in tooltip
  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 p-2 rounded border border-gray-700 shadow-lg">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-xs text-gray-300">
            {data.value} workout{data.value !== 1 ? 's' : ''}
            {data.isComparison && ' (previous period)'}
          </p>
        </div>
      );
    }
    return null;
  };

  // if no data, render a fallback
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No workout type data available
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          {showComparison && (
            <Pie
              data={comparisonChartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={65}
              innerRadius={45}
              dataKey="value"
              stroke="#1A1F2C"
              strokeWidth={1}
            >
              {comparisonChartData.map((entry, index) => (
                <Cell
                  key={`comparison-cell-${index}`}
                  fill={entry.color}
                  opacity={0.6}
                  strokeDasharray="3 3"
                />
              ))}
            </Pie>
          )}
          
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={showComparison ? 100 : 80}
            innerRadius={showComparison ? 70 : 0}
            dataKey="value"
            stroke="#1A1F2C"
            strokeWidth={2}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                opacity={0.8}
              />
            ))}
          </Pie>
          
          <Tooltip content={renderTooltip} />
          
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            formatter={(value: any, entry: any) => (
              <span style={{ color: '#f9fafb' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {showComparison && (
        <div className="text-center text-xs text-gray-400 mt-2">
          <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-1"></span> 
          Current period 
          <span className="inline-block w-3 h-3 rounded-full bg-purple-700 opacity-60 mx-1 ml-3 border-dashed border"></span> 
          Previous period
        </div>
      )}
    </div>
  );
};

// Export the memoized component correctly
export const WorkoutTypeChart = React.memo(WorkoutTypeChartComponent);
