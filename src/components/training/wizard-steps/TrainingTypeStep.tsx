
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Dumbbell, Activity, Compass, Sun } from 'lucide-react';
import { WorkoutStats } from '@/types/workoutStats';

// Function to render the Yoga icon since it's not available in lucide-react
const Yoga = () => (
  <span className="text-lg">🧘</span>
);

interface TrainingTypeStepProps {
  selectedType: string;
  onSelectType: (type: string) => void;
  stats?: WorkoutStats | null;
}

interface TrainingTypeOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function TrainingTypeStep({ selectedType, onSelectType, stats }: TrainingTypeStepProps) {
  // Define training type options
  const trainingTypes: TrainingTypeOption[] = [
    {
      id: 'strength',
      name: 'Strength',
      description: 'Build muscle and increase strength',
      icon: Dumbbell,
      color: 'from-blue-600 to-blue-400',
    },
    {
      id: 'cardio',
      name: 'Cardio',
      description: 'Improve endurance and heart health',
      icon: Activity,
      color: 'from-red-600 to-orange-400',
    },
    {
      id: 'hiit',
      name: 'HIIT',
      description: 'High intensity interval training',
      icon: Sun,
      color: 'from-yellow-600 to-yellow-400',
    },
    {
      id: 'mobility',
      name: 'Yoga & Mobility',
      description: 'Improve flexibility and mindfulness',
      icon: Yoga,
      color: 'from-green-600 to-green-400',
    },
    {
      id: 'custom',
      name: 'Custom',
      description: 'Create your own workout',
      icon: Compass,
      color: 'from-purple-600 to-pink-400',
    },
  ];

  // Calculate metrics-based recommendations
  const recommendedType = stats?.recommendedType || 'strength';
  
  // Type performance metrics from stats
  const typeMetrics = React.useMemo(() => {
    if (!stats) return {};
    
    // Transform workout type stats into a more usable format
    const metrics: Record<string, { count: number, avgDuration: number, improvement: number }> = {};
    
    if (stats.workoutTypeDistribution) {
      stats.workoutTypeDistribution.forEach(type => {
        metrics[type.name.toLowerCase()] = {
          count: type.count,
          avgDuration: type.averageDuration || 0,
          improvement: type.improvement || 0
        };
      });
    }
    
    return metrics;
  }, [stats]);

  // Get recommended tag if any
  const getRecommendationTag = (typeId: string) => {
    if (typeId === recommendedType) {
      return "Recommended";
    }
    
    const typeData = typeMetrics[typeId];
    if (typeData) {
      if (typeData.improvement > 0.1) return "Improving";
      if (typeData.count === 0) return "New";
      if (typeData.improvement < -0.05) return "Needs work";
    }
    
    return null;
  };

  return (
    <div className="space-y-6 pb-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">Choose Training Type</h2>
        <p className="text-gray-400 text-sm">
          Select the type of workout you'd like to do
        </p>
      </div>

      <div className="space-y-3">
        {trainingTypes.map((type) => {
          const isSelected = selectedType === type.id;
          const recommendationTag = getRecommendationTag(type.id);
          const hasMetrics = typeMetrics[type.id];
          
          return (
            <motion.div
              key={type.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectType(type.id)}
              className={cn(
                "p-4 rounded-xl border cursor-pointer transform transition-all",
                isSelected 
                  ? "bg-gray-800 border-purple-500 shadow-lg shadow-purple-900/20" 
                  : "bg-gray-900/50 border-gray-800 hover:bg-gray-800/70",
              )}
            >
              <div className="flex items-center">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mr-4",
                  `bg-gradient-to-br ${type.color}`,
                )}>
                  <type.icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-lg">{type.name}</h3>
                    
                    {recommendationTag && (
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        recommendationTag === "Recommended" 
                          ? "bg-green-900/40 text-green-300 border border-green-500/30" 
                          : recommendationTag === "Improving"
                          ? "bg-blue-900/40 text-blue-300 border border-blue-500/30"
                          : recommendationTag === "Needs work"
                          ? "bg-orange-900/40 text-orange-300 border border-orange-500/30"
                          : "bg-gray-800 text-gray-300 border border-gray-700"
                      )}>
                        {recommendationTag}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-400">{type.description}</p>
                  
                  {hasMetrics && (
                    <div className="flex gap-4 mt-2">
                      <div className="text-xs text-gray-500">
                        <span className="text-gray-400">{typeMetrics[type.id].count}</span> workouts
                      </div>
                      
                      {typeMetrics[type.id].avgDuration > 0 && (
                        <div className="text-xs text-gray-500">
                          avg: <span className="text-gray-400">{Math.round(typeMetrics[type.id].avgDuration)}</span> min
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="w-5 h-5 rounded-full border-2 ml-2 flex-shrink-0
                              transition-colors duration-300 ease-in-out
                              flex items-center justify-center"
                    style={{ 
                      borderColor: isSelected ? '#9b87f5' : '#374151',
                      background: isSelected ? '#9b87f5' : 'transparent',
                    }}>
                  {isSelected && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
