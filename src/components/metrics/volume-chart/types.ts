
import { VolumeDataPoint } from '@/hooks/useProcessWorkoutMetrics';

export interface WorkoutVolumeChartProps {
  data?: VolumeDataPoint[];
  className?: string;
  height?: number;
}

export interface VolumeTooltipProps {
  active?: boolean;
  payload?: any[];
}

export interface VolumeStatsProps {
  total: number;
  average: number;
  weightUnit: string;
}
