
import React from 'react';
import { toast } from '@/hooks/use-toast';
import { Trophy, Star, ArrowUp, Award, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ExperienceGainData {
  amount: number;
  trainingType?: string | null;
  previousLevel?: number;
  newLevel?: number;
}

/**
 * Shows a toast notification with experience gains
 */
export function showExperienceGain(data: ExperienceGainData) {
  const { amount, trainingType, previousLevel, newLevel } = data;
  const levelUp = newLevel && previousLevel && newLevel > previousLevel;
  
  toast({
    title: levelUp ? "Level Up! 🎉" : "Experience Gained!",
    description: (
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="font-mono text-sm font-medium">+{amount} XP</span>
          {trainingType && (
            <span className="text-xs opacity-80">({trainingType})</span>
          )}
        </div>
        
        {levelUp && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 flex items-center text-sm font-medium text-emerald-400"
          >
            <ArrowUp className="w-3.5 h-3.5 mr-1" />
            <span>You reached level {newLevel}!</span>
          </motion.div>
        )}
      </div>
    ),
    variant: levelUp ? "default" : "default",
    duration: levelUp ? 5000 : 3000
  });
}

interface ExperienceGainProps {
  duration?: number;
  className?: string;
  children?: React.ReactNode;
  onComplete?: () => void;
  amount: number;
  trainingType?: string;
}

/**
 * Visual overlay component for experience gains
 */
export const ExperienceGainOverlay: React.FC<ExperienceGainProps> = ({
  amount,
  trainingType,
  duration = 2000,
  className,
  children,
  onComplete
}) => {
  React.useEffect(() => {
    console.log(`Experience animation started, will complete in ${duration}ms`);
    const timer = setTimeout(() => {
      console.log("Experience animation timer completed, calling onComplete");
      onComplete?.();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm",
        className
      )}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 0.6,
            times: [0, 0.3, 0.6, 1],
            repeat: 1
          }}
          className="p-4 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 mb-4"
        >
          <Trophy className="w-10 h-10 text-white" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-white mb-1"
        >
          Experience Gained!
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-mono font-bold text-yellow-400 mb-2"
        >
          +{amount} XP
        </motion.div>
        
        {trainingType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.5 }}
            className="text-white/80 text-sm mb-2"
          >
            {trainingType} Training
          </motion.div>
        )}
        
        {/* Animated XP particles */}
        <div className="relative w-40 h-20">
          {Array(8).fill(0).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: 0, 
                y: 0, 
                opacity: 0,
                scale: 0.2 
              }}
              animate={{ 
                x: Math.random() * 120 - 60,
                y: Math.random() * -80 - 20,
                opacity: [0, 1, 0],
                scale: [0.2, 0.8, 0.1]
              }}
              transition={{ 
                duration: 1.2 + Math.random() * 0.8,
                delay: 0.5 + Math.random() * 0.5,
                ease: "easeOut"
              }}
              className="absolute left-1/2 top-1/2"
            >
              {i % 4 === 0 ? (
                <Star className="w-4 h-4 text-yellow-400" />
              ) : i % 3 === 0 ? (
                <Zap className="w-4 h-4 text-yellow-300" />
              ) : (
                <span className="text-xs font-bold text-yellow-400">+XP</span>
              )}
            </motion.div>
          ))}
        </div>
        
        {children}
      </motion.div>
    </motion.div>
  );
};
