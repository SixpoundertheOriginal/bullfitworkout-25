
import React from 'react';
import { ExerciseSet } from '@/types/exercise';
import { calculateSetVolume } from '@/utils/exerciseUtils';
import { Clock, Weight, Dumbbell, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ExerciseMetricsDisplayProps {
  sets: ExerciseSet[];
  exerciseName: string;
  className?: string;
}

export const ExerciseMetricsDisplay: React.FC<ExerciseMetricsDisplayProps> = ({
  sets,
  exerciseName,
  className
}) => {
  const isMobile = useIsMobile();
  
  // Calculate total tonnage (volume)
  const totalTonnage = sets.reduce((sum, set) => {
    if (set.completed) {
      return sum + calculateSetVolume(set, exerciseName);
    }
    return sum;
  }, 0);
  
  // Calculate work time (excluding rest periods)
  const completedSets = sets.filter(set => set.completed).length;
  const avgTimePerSet = 45; // Assumption: average 45 seconds per set
  const totalWorkTime = completedSets * avgTimePerSet;
  
  // Calculate density (volume per minute)
  const workTimeInMinutes = totalWorkTime / 60;
  const density = workTimeInMinutes > 0 ? totalTonnage / workTimeInMinutes : 0;
  
  // Format numbers for display
  const formattedTonnage = totalTonnage.toFixed(1);
  const formattedDensity = density.toFixed(1);
  
  if (sets.length === 0 || !sets.some(set => set.completed)) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "mt-2 px-3 py-2 rounded-md bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/30",
        className
      )}
    >
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center">
          <div className="mr-2 p-1 rounded-full bg-purple-900/30">
            <Weight className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Volume</div>
            <div className="font-medium text-white">{formattedTonnage} kg</div>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="mr-2 p-1 rounded-full bg-green-900/30">
            <BarChart className="h-4 w-4 text-green-400" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Density</div>
            <div className="font-medium text-white">{formattedDensity} kg/min</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
