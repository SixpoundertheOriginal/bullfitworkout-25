
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Dumbbell, Clock, Target, Zap, ChevronRight } from 'lucide-react';
import { WorkoutStats } from '@/types/workout';
import { ExerciseSelector } from '@/components/exercises/ExerciseSelector';
import { TrainingConfig } from '../ExerciseSetupWizard';

interface ReviewAndStartStepProps {
  config: TrainingConfig;
  stats?: WorkoutStats | null;
}

export function ReviewAndStartStep({ config, stats }: ReviewAndStartStepProps) {
  // Animated metrics
  const xpValue = config.expectedXp;
  const [displayedXp, setDisplayedXp] = React.useState(0);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedXp(prev => {
        if (prev < xpValue) {
          return Math.min(prev + Math.ceil(xpValue / 20), xpValue);
        }
        clearInterval(interval);
        return prev;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [xpValue]);

  // Get training type image/icon
  const getTrainingTypeIcon = () => {
    switch (config.trainingType) {
      case 'strength':
        return <Dumbbell className="h-6 w-6" />;
      case 'cardio':
        return <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-6 w-6 flex items-center justify-center"
        >
          <span className="text-lg">🔥</span>
        </motion.div>;
      case 'hiit':
        return <motion.div 
          animate={{ rotate: [0, 15, 0, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-6 w-6 flex items-center justify-center"
        >
          <span className="text-lg">⚡</span>
        </motion.div>;
      case 'yoga':
        return <motion.div 
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-6 w-6 flex items-center justify-center"
        >
          <span className="text-lg">🧘</span>
        </motion.div>;
      default:
        return <Target className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-6 pb-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">Ready to Begin</h2>
        <p className="text-gray-400 text-sm">
          Review your workout plan and start training
        </p>
      </div>

      {/* Workout Summary Card */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-5 shadow-lg"
      >
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center mr-3">
            {getTrainingTypeIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-lg capitalize">{config.trainingType} Workout</h3>
            <p className="text-xs text-gray-400">Personalized for best results</p>
          </div>
        </div>
        
        <div className="space-y-4 mt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="h-4 w-4 text-purple-400 mr-2" />
              <span className="text-sm text-gray-300">Focus</span>
            </div>
            <div className="text-sm font-medium">
              {config.bodyFocus.length > 0 
                ? config.bodyFocus.join(', ') 
                : 'Full Body'}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-purple-400 mr-2" />
              <span className="text-sm text-gray-300">Duration</span>
            </div>
            <div className="text-sm font-medium">
              {config.duration} minutes
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="h-4 w-4 text-purple-400 mr-2" />
              <span className="text-sm text-gray-300">Expected XP</span>
            </div>
            <div className="text-sm font-medium">
              <motion.span 
                key={displayedXp}
                animate={{ 
                  scale: displayedXp === xpValue ? [1, 1.1, 1] : 1 
                }}
                transition={{ duration: 0.5 }}
                className="text-yellow-400 font-bold"
              >
                +{displayedXp}
              </motion.span> XP
            </div>
          </div>
        </div>
        
        {config.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {config.tags.map(tag => (
              <span 
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>
      
      {/* Level Progress Preview */}
      {stats && (
        <div className="mt-6">
          <p className="text-sm text-gray-400 mb-2">Level Progress Preview</p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 rounded-lg border border-gray-700 p-3"
          >
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mr-2 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {Math.min(99, Math.floor((stats.totalXp || 0) / 100) + 1)}
                  </span>
                </div>
                <span className="text-sm">Fitness Level</span>
              </div>
              
              <span className="text-xs text-gray-400">
                {(stats.totalXp || 0) % 100}/100 XP
              </span>
            </div>
            
            <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                style={{ 
                  width: `${(stats.totalXp || 0) % 100}%`,
                  transition: 'width 1s ease-in-out'
                }}
              />
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-2 flex justify-between items-center"
            >
              <div className="h-2 bg-gray-900 rounded-full overflow-hidden flex-1 mr-3">
                <motion.div 
                  initial={{ width: `${(stats.totalXp || 0) % 100}%` }}
                  animate={{ width: `${((stats.totalXp || 0) + xpValue) % 100}%` }}
                  transition={{ delay: 1, duration: 1 }}
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
                />
              </div>
              
              <span className="text-xs font-semibold text-yellow-400">+{xpValue} XP</span>
            </motion.div>
          </motion.div>
        </div>
      )}
      
      {/* Suggested Exercises */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Suggested Exercises</h3>
          <button className="text-xs text-purple-400 flex items-center">
            View All <ChevronRight className="h-3 w-3 ml-1" />
          </button>
        </div>
        
        <ExerciseSelector
          onSelectExercise={() => {}}
          trainingType={config.trainingType}
          bodyFocus={config.bodyFocus}
          useLegacyDesign={true}
        />
      </div>
    </div>
  );
}
