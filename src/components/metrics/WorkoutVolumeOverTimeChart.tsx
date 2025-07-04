
import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Line,
  ComposedChart
} from 'recharts';
import { VolumeDataPoint } from '@/hooks/useProcessWorkoutMetrics';
import { useWeightUnit } from '@/context/WeightUnitContext';
import { format } from 'date-fns';

interface WorkoutVolumeOverTimeChartProps {
  data: VolumeDataPoint[];
  height?: number;
  className?: string;
  comparisonData?: VolumeDataPoint[];
}

export const WorkoutVolumeOverTimeChart: React.FC<WorkoutVolumeOverTimeChartProps> = ({
  data,
  height = 300,
  className = "",
  comparisonData
}) => {
  const { weightUnit } = useWeightUnit();
  
  // Add a safety check to ensure data is an array
  const safeData = Array.isArray(data) ? data : [];
  
  // Add safety checks for comparison data
  const hasComparisonData = React.useMemo(() => {
    return comparisonData && 
           Array.isArray(comparisonData) && 
           comparisonData.length > 0;
  }, [comparisonData]);
  
  const safeComparisonData = hasComparisonData && Array.isArray(comparisonData) ? comparisonData : [];
  
  console.log("[WorkoutVolumeOverTimeChart] Data:", safeData.length, "Comparison data:", safeComparisonData?.length || 0);
  
  // Prepare chart data - if we have comparison data, merge the datasets
  const chartData = React.useMemo(() => {
    if (!hasComparisonData) {
      // Handle single dataset case
      return safeData.map(item => ({
        date: item.date ? format(new Date(item.date), 'MMM dd') : '',
        volume: item.volume || 0
      }));
    }
    
    try {
      // Create a map of dates to volumes for the current period
      const currentMap = safeData.reduce((acc, item) => {
        if (!item || !item.date) return acc;
        const dateStr = format(new Date(item.date), 'MMM dd');
        acc[dateStr] = item.volume || 0;
        return acc;
      }, {} as Record<string, number>);
      
      // Create a map of dates to volumes for the comparison period
      const comparisonMap = safeComparisonData.reduce((acc, item, index) => {
        if (!item || !item.date) return acc;
        
        // For comparison data, we use the same date labels as the current period if available
        const currentPeriodDate = safeData[index]?.date ? 
          format(new Date(safeData[index].date), 'MMM dd') : 
          `Day ${index + 1}`;
          
        acc[currentPeriodDate] = item.volume || 0;
        return acc;
      }, {} as Record<string, number>);
      
      // Combine both datasets, ensuring all dates from both periods are included
      const allDates = [...new Set([
        ...Object.keys(currentMap),
        ...Object.keys(comparisonMap)
      ])].sort((a, b) => {
        // Try to parse and compare dates, fall back to string comparison
        try {
          return new Date(a).getTime() - new Date(b).getTime();
        } catch (e) {
          return a.localeCompare(b);
        }
      });
      
      return allDates.map(date => ({
        date,
        volume: currentMap[date] || 0,
        previousVolume: comparisonMap[date] || 0
      }));
    } catch (error) {
      console.error("[WorkoutVolumeOverTimeChart] Error processing chart data:", error);
      return safeData.map(item => ({
        date: item.date ? format(new Date(item.date), 'MMM dd') : '',
        volume: item.volume || 0
      }));
    }
  }, [safeData, safeComparisonData, hasComparisonData]);

  // Choose the appropriate chart type based on whether we have comparison data
  const ChartComponent = hasComparisonData ? ComposedChart : BarChart;
  
  // If no data, show a fallback message
  if (!safeData.length) {
    return (
      <div className={`w-full ${className} flex items-center justify-center`} style={{ height }}>
        <p className="text-gray-400">No workout volume data available</p>
      </div>
    );
  }
  
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#BBB' }}
            tickMargin={10}
          />
          <YAxis 
            tick={{ fill: '#BBB' }}
            tickMargin={10}
            tickFormatter={(value) => `${value.toLocaleString()}`}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toLocaleString()} ${weightUnit}`, 'Volume']}
            contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px' }}
            labelStyle={{ color: '#EEE', marginBottom: '6px' }}
          />
          <Legend />
          
          <Bar 
            dataKey="volume" 
            name="Current Period" 
            fill="#8884d8" 
            radius={[4, 4, 0, 0]} 
          />
          
          {hasComparisonData && (
            <Line
              type="monotone"
              dataKey="previousVolume"
              name="Previous Period"
              stroke="#ff7300"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};
