
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dumbbell, Zap, Heart, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkoutStats } from '@/types/workoutStats';

interface TrainingTypeStepProps {
  selectedType: string;
  onSelectType: (type: string) => void;
  onAutoAdvance?: () => void;
  stats?: WorkoutStats | null;
  enableAutoAdvance?: boolean;
  autoAdvanceDelay?: number;
}

const trainingTypes = [
  {
    id: 'strength',
    label: 'Strength',
    icon: Dumbbell,
    description: 'Build muscle and power',
    gradient: 'from-blue-500 to-purple-600'
  },
  {
    id: 'cardio',
    label: 'Cardio',
    icon: Heart,
    description: 'Improve endurance',
    gradient: 'from-red-500 to-pink-500'
  },
  {
    id: 'hiit',
    label: 'HIIT',
    icon: Zap,
    description: 'High intensity intervals',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    id: 'mobility',
    label: 'Mobility',
    icon: Activity,
    description: 'Flexibility and recovery',
    gradient: 'from-green-500 to-teal-500'
  }
];

export function TrainingTypeStep({ 
  selectedType, 
  onSelectType, 
  stats,
  enableAutoAdvance = true,
  autoAdvanceDelay = 500
}: TrainingTypeStepProps) {
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Handle training type selection with user interaction tracking
  const handleTypeSelection = (typeId: string) => {
    console.log('🎯 Training type button clicked:', { typeId, previous: selectedType });
    
    // Mark that user has interacted
    setHasUserInteracted(true);
    
    // Call the parent handler with user interaction flag
    onSelectType(typeId);
  };

  // Get recommended type from stats
  const getRecommendedType = () => {
    if (stats?.recommendedType) {
      return stats.recommendedType.toLowerCase();
    }
    return null;
  };

  const recommendedType = getRecommendedType();

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-xl font-semibold mb-1">Choose Your Training Type</h2>
        <p className="text-gray-400 text-sm mb-4">
          Select the type of workout you want to do today
        </p>
        {recommendedType && (
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 mb-4">
            <p className="text-sm text-purple-300">
              💡 Recommended: <span className="font-medium capitalize">{recommendedType}</span> based on your recent activity
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {trainingTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          const isRecommended = recommendedType === type.id;
          
          return (
            <motion.div
              key={type.id}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Button
                onClick={() => handleTypeSelection(type.id)}
                className={cn(
                  "w-full h-auto p-4 flex flex-col items-center gap-3 relative overflow-hidden",
                  "transition-all duration-300 group",
                  isSelected
                    ? `bg-gradient-to-br ${type.gradient} text-white shadow-lg border-white/20`
                    : "bg-gray-800/50 hover:bg-gray-700/50 border-gray-700 text-gray-300 hover:text-white"
                )}
                variant={isSelected ? "default" : "outline"}
              >
                {isRecommended && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  </div>
                )}
                
                <Icon 
                  className={cn(
                    "h-8 w-8 transition-transform duration-300",
                    isSelected ? "scale-110" : "group-hover:scale-105"
                  )} 
                />
                
                <div className="text-center">
                  <div className="font-semibold text-base mb-1">{type.label}</div>
                  <div className={cn(
                    "text-xs transition-colors duration-300",
                    isSelected ? "text-white/80" : "text-gray-400 group-hover:text-gray-300"
                  )}>
                    {type.description}
                  </div>
                </div>
                
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 border-2 border-white/30 rounded-lg pointer-events-none"
                  />
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {hasUserInteracted && selectedType && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-gray-400"
        >
          Great choice! Setting up your {selectedType} workout...
        </motion.div>
      )}
    </div>
  );
}
