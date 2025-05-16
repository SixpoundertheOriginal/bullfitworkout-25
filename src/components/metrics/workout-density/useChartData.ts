
import { useMemo } from 'react';
import { format } from 'date-fns';
import { DensityDataPoint } from '@/hooks/useProcessWorkoutMetrics';

interface ChartDataResult {
  hasData: boolean;
  formattedData: Array<{
    date: string;
    density: number;
    dateLabel: string;
    workoutId?: string | null;
  }>;
  averages: {
    overall: number;
    activeOnly: number;
  };
}

export function useChartData(data: DensityDataPoint[] = []): ChartDataResult {
  // Log input data for debugging
  console.log("[useChartData] Input data:", data);

  // Check for valid density data
  const hasData = useMemo(() => 
    Array.isArray(data) && 
    data.length > 0 && 
    data.some(item => item && typeof item.density === 'number' && item.volume && item.duration),
    [data]
  );

  // Format data for chart display
  const formattedData = useMemo(() => {
    if (!hasData) return [];
    
    return data
      .filter(item => 
        item && 
        typeof item === 'object' && 
        typeof item.density === 'number' &&
        item.date
      )
      .map(item => {
        // Get date from the item
        const date = new Date(item.date);
        
        return {
          date: format(date, 'MMM d'),
          dateLabel: format(date, 'MMM d, yyyy'),
          density: item.density || 0,
          workoutId: item.workoutId
        };
      });
  }, [data, hasData]);

  // Calculate averages
  const averages = useMemo(() => {
    if (!hasData) {
      return { overall: 0, activeOnly: 0 };
    }
    
    // Enhanced calculation with fallbacks and better filtering
    let totalDensity = 0;
    let totalActiveOnlyDensity = 0;
    let count = 0;
    let activeCount = 0;
    
    data.forEach(item => {
      if (item && typeof item.density === 'number') {
        // For overall density (volume / total duration)
        if (item.volume && item.duration) {
          totalDensity += item.volume / item.duration;
          count++;
          
          // Log each calculation for debugging
          console.log(`[useChartData] Item ${count}: volume=${item.volume}, duration=${item.duration}, density=${item.volume / item.duration}`);
        }
        
        // For active-only density if available
        if (item.overallDensity) {
          totalActiveOnlyDensity += item.overallDensity;
          activeCount++;
        } else if (item.density) {
          // Fallback to regular density if active-only not available
          totalActiveOnlyDensity += item.density;
          activeCount++;
        }
      }
    });
    
    // Calculate averages with safety checks
    const overall = count > 0 ? totalDensity / count : 0;
    const activeOnly = activeCount > 0 ? totalActiveOnlyDensity / activeCount : 0;
    
    console.log(`[useChartData] Final calculations: overall=${overall}, activeOnly=${activeOnly}, count=${count}`);
    
    return { overall, activeOnly };
  }, [data, hasData]);

  return {
    hasData,
    formattedData,
    averages
  };
}
