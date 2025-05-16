
import { VolumeDataPoint } from '@/hooks/useProcessWorkoutMetrics';
import { WeightUnit } from '@/utils/unitConversion';

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
  weightUnit: WeightUnit | string;
}
