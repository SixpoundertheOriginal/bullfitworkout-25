
import { useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { WeightUnit } from '@/utils/unitConversion';
import { VolumeDataPoint } from '@/hooks/useProcessWorkoutMetrics';
import { useNavigate } from 'react-router-dom';

export function useVolumeChartData(data: VolumeDataPoint[] = []) {
  const navigate = useNavigate();

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
          sets: item?.sets || 0,
          workoutId: item?.workoutId || null,
        };
        
        return {
          date: format(new Date(safeItem.date), 'MMM d'),
          dateLabel: format(new Date(safeItem.date), 'MMM d, yyyy'),
          volume: safeItem.volume,
          sets: safeItem.sets,
          originalDate: safeItem.date,
          formattedValue: `${safeItem.volume.toLocaleString()}`,
          workoutId: safeItem.workoutId,
          cursor: safeItem.workoutId ? 'pointer' : 'default'
        };
      });
  }, [data, hasData]);
  
  // Memoize volume stats calculations
  const volumeStats = useMemo(() => {
    if (!hasData) return { total: 0, average: 0 };
    
    const validVolumes = formattedData.map(d => d.volume).filter(v => !isNaN(v));
    const total = validVolumes.reduce((sum, vol) => sum + vol, 0);
    const average = validVolumes.length > 0 ? total / validVolumes.length : 0;
    
    return { total, average };
  }, [formattedData, hasData]);

  // Handle bar click event
  const handleBarClick = useCallback((data: any) => {
    if (data && data.workoutId) {
      console.log('Navigating to workout details:', data.workoutId);
      navigate(`/workout-details/${data.workoutId}`);
    }
  }, [navigate]);

  return {
    hasData,
    formattedData,
    volumeStats,
    handleBarClick
  };
}
