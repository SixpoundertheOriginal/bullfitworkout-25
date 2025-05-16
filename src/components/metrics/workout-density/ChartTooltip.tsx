
import React from 'react';
import { format } from 'date-fns';
import { WeightUnit } from '@/utils/unitConversion';

interface TooltipContentProps {
  active?: boolean;
  payload?: any[];
  weightUnit: WeightUnit;
}

export const ChartTooltip: React.FC<TooltipContentProps> = ({ 
  active, 
  payload, 
  weightUnit 
}) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-gray-800 border border-gray-700 p-2 rounded-lg shadow-lg">
      <p className="text-gray-300">
        {format(new Date(payload[0].payload.originalDate), 'MMM d, yyyy')}
      </p>
      <p className="text-purple-400 font-semibold">
        Overall: {payload[0].value} {weightUnit}/min
      </p>
      {payload[1] && payload[1].value !== undefined && (
        <p className="text-blue-400 font-semibold">
          Active Only: {payload[1].value} {weightUnit}/min
        </p>
      )}
    </div>
  );
};
