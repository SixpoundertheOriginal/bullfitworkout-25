
import React from 'react';
import { Dumbbell, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutStatsDisplayProps {
  exerciseCount: number;
  completedSets: number;
  totalSets: number;
  className?: string;
}

export const WorkoutStatsDisplay: React.FC<WorkoutStatsDisplayProps> = ({
  exerciseCount,
  completedSets,
  totalSets,
  className
}) => {
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  
  return (
    <div className={cn(
      "grid grid-cols-2 gap-3", 
      className
    )}>
      {/* Exercise Count */}
      <div className="rounded-xl bg-gray-900/80 backdrop-blur-md border border-white/10 p-3 shadow-md">
        <div className="flex items-center mb-1">
          <Dumbbell className="h-4 w-4 text-blue-400 mr-1.5" />
          <span className="text-xs font-medium text-gray-400">Exercises</span>
        </div>
        <div className="text-xl font-semibold text-white">{exerciseCount}</div>
      </div>
      
      {/* Sets Progress */}
      <div className="rounded-xl bg-gray-900/80 backdrop-blur-md border border-white/10 p-3 shadow-md">
        <div className="flex items-center mb-1">
          <Award className="h-4 w-4 text-purple-400 mr-1.5" />
          <span className="text-xs font-medium text-gray-400">Sets</span>
        </div>
        <div className="text-xl font-semibold text-white">
          {completedSets}/{totalSets}
        </div>
        {totalSets > 0 && (
          <div className="mt-1 h-1 w-full bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
