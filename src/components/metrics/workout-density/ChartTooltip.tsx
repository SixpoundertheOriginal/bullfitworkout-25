
import React from 'react';
import { format } from 'date-fns';
import { WeightUnit } from '@/utils/unitConversion';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  weightUnit: WeightUnit;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  weightUnit
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  // Extract data from the payload
  const data = payload[0].payload;
  const date = data.originalDate ? new Date(data.originalDate) : new Date();
  
  // Only show clickable hint if workoutId exists
  const hasWorkoutId = Boolean(data.workoutId);

  return (
    <div className="bg-gray-800 border border-gray-700 p-2 rounded-lg shadow-lg">
      <p className="text-gray-300 font-medium">
        {format(date, 'MMM d, yyyy')}
      </p>
      <div className="grid grid-cols-1 gap-1 mt-1">
        <p className="text-sm">
          <span className="text-purple-400">Overall: </span>
          <span className="text-gray-200 font-medium">
            {data.overallDensity.toFixed(2)} {weightUnit}/min
          </span>
        </p>
        <p className="text-sm">
          <span className="text-blue-400">Active: </span>
          <span className="text-gray-200 font-medium">
            {data.activeOnlyDensity.toFixed(2)} {weightUnit}/min
          </span>
        </p>
        
        {hasWorkoutId && (
          <p className="text-xs italic text-gray-400 mt-1 border-t border-gray-700 pt-1">
            Click to view workout details
          </p>
        )}
      </div>
    </div>
  );
};
