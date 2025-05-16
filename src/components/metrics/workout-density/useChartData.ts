
import { useMemo } from 'react';
import { format } from 'date-fns';
import { DensityDataPoint } from '@/hooks/useProcessWorkoutMetrics';

export function useChartData(data: DensityDataPoint[] = []) {
  // Determine if there's valid density data
  const hasData = useMemo(
    () =>
      Array.isArray(data) &&
      data.length > 0 &&
      data.some(item => item && typeof item.overallDensity === 'number' && item.overallDensity > 0),
    [data]
  );

  // Format data for the chart
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

  // Calculate average densities
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

  return { hasData, formattedData, averages };
}
