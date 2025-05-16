
import React from 'react';
import { format } from 'date-fns';
import { VolumeTooltipProps } from './types';

export const VolumeTooltip: React.FC<VolumeTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-gray-800 border border-gray-700 p-2 rounded-lg shadow-lg">
      <p className="text-gray-300">
        {format(new Date(payload[0].payload.originalDate), 'MMM d, yyyy')}
      </p>
      <p className="text-purple-400 font-semibold">
        {payload[0].payload.formattedValue}
      </p>
      {payload[0].payload.workoutId && (
        <p className="text-xs text-blue-300 mt-1">Click to view details</p>
      )}
    </div>
  );
};
