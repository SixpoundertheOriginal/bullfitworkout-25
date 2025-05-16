
import React from 'react';
import { WeightUnit } from '@/utils/unitConversion';

interface DensitySummaryProps {
  overall: number;
  activeOnly: number;
  weightUnit: WeightUnit;
}

export const DensitySummary: React.FC<DensitySummaryProps> = ({
  overall,
  activeOnly,
  weightUnit
}) => {
  // Format the numbers to have consistent decimal places
  const formattedOverall = overall.toFixed(1);
  const formattedActiveOnly = activeOnly.toFixed(1);
  
  return (
    <div className="mt-4 grid grid-cols-2 gap-4 text-center">
      <div>
        <p className="text-xs text-gray-400 mb-1">Overall Density</p>
        <p className="text-lg font-semibold text-purple-400">
          {formattedOverall}{' '}
          <span className="text-sm text-gray-400">{weightUnit}/min</span>
        </p>
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-1">Active Density</p>
        <p className="text-lg font-semibold text-blue-400">
          {formattedActiveOnly}{' '}
          <span className="text-sm text-gray-400">{weightUnit}/min</span>
        </p>
      </div>
    </div>
  );
};
