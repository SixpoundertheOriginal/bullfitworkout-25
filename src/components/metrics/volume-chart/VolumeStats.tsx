
import React from 'react';
import { VolumeStatsProps } from './types';

export const VolumeStats: React.FC<VolumeStatsProps> = ({ total, average, weightUnit }) => {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4 text-center">
      <div>
        <p className="text-xs text-gray-400 mb-1">Total Volume</p>
        <p className="text-lg font-semibold text-purple-400">
          {Math.round(total).toLocaleString()}{' '}
          <span className="text-sm text-gray-400">{weightUnit}</span>
        </p>
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-1">Average Volume</p>
        <p className="text-lg font-semibold text-blue-400">
          {Math.round(average).toLocaleString()}{' '}
          <span className="text-sm text-gray-400">{weightUnit}</span>
        </p>
      </div>
    </div>
  );
};
