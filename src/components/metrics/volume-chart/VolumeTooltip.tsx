
import React from 'react';
import { VolumeTooltipProps } from './types';

export const VolumeTooltip: React.FC<VolumeTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded p-2 shadow-xl">
      <p className="font-semibold text-sm">{data.dateLabel}</p>
      <p className="text-xs text-gray-400">
        Volume: <span className="text-purple-400 font-medium">{data.volume.toLocaleString()}</span>
      </p>
      {data.sets && (
        <p className="text-xs text-gray-400">
          Sets: <span className="text-blue-400 font-medium">{data.sets}</span>
        </p>
      )}
    </div>
  );
};
