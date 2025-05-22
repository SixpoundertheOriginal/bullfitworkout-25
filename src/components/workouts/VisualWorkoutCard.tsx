
import React from 'react';
import { Clock, Dumbbell, Flame, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VisualWorkoutCardProps {
  title: string;
  duration: number;
  intensity: number;
  muscleGroups?: string[];
  onClick?: () => void;
  className?: string;
}

export const VisualWorkoutCard: React.FC<VisualWorkoutCardProps> = ({
  title,
  duration,
  intensity,
  muscleGroups = [],
  onClick,
  className
}) => {
  // Function to render muscle group indicators
  const renderMuscleIndicators = () => {
    const displayMuscles = muscleGroups.slice(0, 3); // Show max 3 muscle groups
    
    return (
      <div className="flex space-x-1">
        {displayMuscles.map((muscle, index) => (
          <div 
            key={index} 
            className="px-1.5 py-0.5 bg-white/10 rounded text-xs"
          >
            {muscle}
          </div>
        ))}
        {muscleGroups.length > 3 && (
          <div className="px-1.5 py-0.5 bg-white/10 rounded text-xs">
            +{muscleGroups.length - 3}
          </div>
        )}
      </div>
    );
  };
  
  // Intensity level visualization
  const renderIntensityMeter = () => {
    const levels = 5;
    const filledLevels = Math.min(Math.max(1, Math.round(intensity * levels / 10)), levels);
    
    return (
      <div className="flex items-center space-x-1">
        <Flame className="h-3 w-3 text-orange-400 mr-0.5" />
        <div className="flex space-x-0.5">
          {[...Array(levels)].map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 w-1.5 rounded-full", 
                i < filledLevels 
                  ? "bg-gradient-to-r from-orange-500 to-red-500" 
                  : "bg-gray-700"
              )}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "bg-gradient-to-br from-gray-800/80 to-gray-900",
        "border border-gray-700/50 rounded-xl p-4",
        "cursor-pointer transition-all",
        "hover:shadow-lg hover:shadow-purple-900/10 hover:border-purple-700/30",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        <div className="flex items-center space-x-1 text-white/70">
          <Clock className="h-3 w-3" />
          <span className="text-xs">{duration} min</span>
        </div>
      </div>
      
      <div className="mb-4 flex justify-between">
        {renderIntensityMeter()}
        <div className="flex items-center text-xs text-white/60">
          <TrendingUp className="h-3 w-3 mr-0.5 text-green-400" />
          <span>High XP</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        {renderMuscleIndicators()}
        <Dumbbell className="h-4 w-4 text-white/40" />
      </div>
    </motion.div>
  );
};
