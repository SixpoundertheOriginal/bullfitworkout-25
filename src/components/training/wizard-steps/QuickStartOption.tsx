
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Clock, Dumbbell, Activity, Target, ChevronRight, Trophy, ArrowRight } from 'lucide-react';
import { WorkoutStats } from '@/types/workoutStats';
import { formatDuration, formatDurationHuman } from '@/utils/formatTime';
import { useTrainingSetupPersistence } from '@/hooks/useTrainingSetupPersistence';

interface QuickStartOptionProps {
  onSelect: (config: any) => void;
  onCustomize: () => void;
  stats?: WorkoutStats | null;
}

export default function QuickStartOption({ onSelect, onCustomize, stats }: QuickStartOptionProps) {
  const { storedConfig, isConfigRecent } = useTrainingSetupPersistence();
  const [hasRecentConfig, setHasRecentConfig] = useState(false);
  const [recentWorkoutType, setRecentWorkoutType] = useState<string | null>(null);
  const [recentWorkoutDuration, setRecentWorkoutDuration] = useState<number | null>(null);
  
  // Generate quick start options based on user stats
  const recommendedType = stats?.recommendedType?.toLowerCase() || 'strength';
  const recommendedDuration = stats?.recommendedDuration || 30;
  
  useEffect(() => {
    // Check if there's a recent config to use
    if (storedConfig && isConfigRecent()) {
      setHasRecentConfig(true);
      setRecentWorkoutType(storedConfig.trainingType);
      setRecentWorkoutDuration(storedConfig.duration);
    } else {
      setHasRecentConfig(false);
    }
  }, [storedConfig, isConfigRecent]);
  
  // Pre-defined quick workouts
  const quickOptions = [
    // Add a recent workout option conditionally
    ...(hasRecentConfig ? [{
      id: 'recent',
      name: `Recent ${recentWorkoutType?.charAt(0).toUpperCase()}${recentWorkoutType?.slice(1)} Workout`,
      type: recentWorkoutType || recommendedType,
      duration: recentWorkoutDuration || recommendedDuration,
      focus: [],
      description: 'Based on your recent activity',
      color: 'from-green-500 to-emerald-700',
      isPrimary: true
    }] : []),
    {
      id: 'recommended',
      name: 'Recommended Workout',
      type: recommendedType,
      duration: recommendedDuration,
      focus: [],
      description: 'Based on your workout history',
      color: 'from-blue-500 to-indigo-700',
      isPrimary: !hasRecentConfig // Primary if no recent workout
    },
    {
      id: 'quick',
      name: 'Quick Strength',
      type: 'strength',
      duration: 20,
      focus: ['Arms', 'Chest'],
      description: '20 min upper body workout',
      color: 'from-purple-600 to-blue-800'
    },
    {
      id: 'cardio',
      name: 'Cardio Blast',
      type: 'cardio',
      duration: 25,
      focus: [],
      description: '25 min cardiovascular training',
      color: 'from-red-500 to-orange-600'
    },
    {
      id: 'hiit',
      name: 'HIIT Session',
      type: 'hiit',
      duration: 15,
      focus: [],
      description: '15 min high intensity intervals',
      color: 'from-yellow-500 to-amber-600'
    },
    {
      id: 'fullBody',
      name: 'Full Body',
      type: 'strength',
      duration: 45,
      focus: ['Legs', 'Back', 'Chest', 'Arms', 'Core'],
      description: '45 min complete workout',
      color: 'from-purple-600 to-indigo-800'
    }
  ];
  
  // Function to start a quick workout
  const handleQuickStart = (option: any) => {
    onSelect({
      trainingType: option.type,
      bodyFocus: option.focus,
      duration: option.duration,
      tags: [],
      quickStart: true // Add flag indicating this was a quick start
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Quick Start</h2>
        <p className="text-gray-400 mt-1">
          Start a workout in seconds or customize one
        </p>
      </div>
      
      <div className="space-y-4 mt-6">
        {quickOptions.map(option => (
          <motion.div
            key={option.id}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "rounded-xl overflow-hidden cursor-pointer border border-gray-800",
              option.isPrimary ? "bg-gradient-to-br from-gray-800/90 to-gray-900" : "bg-gray-900/60"
            )}
            onClick={() => handleQuickStart(option)}
          >
            <div className="flex items-center p-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mr-4",
                `bg-gradient-to-br ${option.color}`
              )}>
                {option.type === 'strength' && <Dumbbell className="h-6 w-6 text-white" />}
                {option.type === 'cardio' && <Activity className="h-6 w-6 text-white" />}
                {option.type === 'hiit' && <span className="text-lg">⚡</span>}
                {option.type === 'mobility' && <span className="text-lg">🧘</span>}
                {!['strength', 'cardio', 'hiit', 'mobility'].includes(option.type || '') && (
                  <Target className="h-6 w-6 text-white" />
                )}
              </div>
              
              <div className="flex-1">
                <h3 className={cn(
                  "font-semibold text-lg",
                  option.isPrimary && "text-white"
                )}>
                  {option.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {option.description}
                </p>
                
                <div className="flex items-center mt-2">
                  <Clock className="h-3 w-3 text-gray-500 mr-1" />
                  <span className="text-xs text-gray-500">{option.duration} min</span>
                  
                  <span className="mx-2 text-gray-700">•</span>
                  
                  <span className="text-xs text-gray-500 capitalize">{option.type}</span>
                  
                  <div className="flex items-center ml-auto">
                    <span className="text-xs text-yellow-400 font-medium mr-2">
                      +{option.duration * 2} XP
                    </span>
                    
                    <div className="p-1 bg-gray-800/50 rounded-full">
                      <ChevronRight className="h-3 w-3 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {option.isPrimary && (
              <div className="bg-gradient-to-r from-purple-600/30 to-pink-500/30 px-4 py-2 flex justify-end">
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5" />
                  Start Quest
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 px-4">
        <Button 
          variant="outline"
          className="w-full border-gray-800 text-purple-400 hover:text-purple-300 flex items-center justify-center gap-1.5"
          onClick={onCustomize}
        >
          Customize My Workout
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
