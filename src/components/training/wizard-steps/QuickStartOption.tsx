
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { TrainingConfig } from '../ExerciseSetupWizard';

interface QuickStartOptionProps {
  config: TrainingConfig;
  onQuickStart: () => void;
  isLoading?: boolean;
}

export function QuickStartOption({ config, onQuickStart, isLoading = false }: QuickStartOptionProps) {
  // Calculate time of day greeting
  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };
  
  const timeOfDay = getTimeOfDayGreeting();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="px-4 py-4"
    >
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onQuickStart}
        disabled={isLoading}
        className={cn(
          "w-full rounded-xl overflow-hidden border border-purple-500/30",
          "bg-gradient-to-br from-purple-900/40 to-purple-800/20",
          "p-4 text-left relative shadow-lg"
        )}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
          </div>
        ) : (
          <>
            <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-bl-3xl" />
            
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                <Sparkles className="h-5 w-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base">Good {timeOfDay}! Quick start?</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {config.duration}min {config.trainingType} workout focused on {config.bodyFocus.join(', ')}
                </p>
                
                <div className="flex items-center justify-between mt-2.5">
                  <div className="flex items-center">
                    <span className="text-yellow-400 text-xs font-semibold">+{config.expectedXp} XP</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-purple-400 mr-1">Start now</span>
                    <ChevronRight className="h-3 w-3 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
