
import React from 'react';
import { Dumbbell } from 'lucide-react';

interface ChartHeaderProps {
  title: string;
  average?: number;
  weightUnit?: string;
}

export const ChartHeader: React.FC<ChartHeaderProps> = ({ 
  title, 
  average, 
  weightUnit 
}) => {
  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-2">
      <div className="flex items-center text-sm text-gray-300">
        <Dumbbell className="h-4 w-4 mr-2 text-purple-400" />
        {title}
      </div>
      {average !== undefined && (
        <div className="text-xs text-gray-400">
          Avg: {Math.round(average).toLocaleString()} {weightUnit}
        </div>
      )}
    </div>
  );
};
