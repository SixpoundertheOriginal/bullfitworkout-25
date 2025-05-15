
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell, Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export interface EmptyWorkoutStateProps {
  onTemplateSelect?: (template: string) => void;
  onAddExerciseClick: () => void;
}

export function EmptyWorkoutState({ 
  onTemplateSelect, 
  onAddExerciseClick 
}: EmptyWorkoutStateProps) {
  
  // Common exercises people might want to add quickly
  const quickExercises = [
    'Bench Press',
    'Squat',
    'Deadlift',
    'Pull-up',
    'Push-up'
  ];
  
  return (
    <Card className="p-6 text-center bg-gradient-to-b from-gray-900/90 to-gray-800/70 border border-white/5 shadow-xl rounded-xl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="relative">
          <Dumbbell className="h-16 w-16 mx-auto mb-2 text-purple-500/60" />
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="h-6 w-6 text-purple-400" />
          </motion.div>
        </div>
        
        <h3 className="text-xl font-medium mb-2 text-white">Start Your Workout</h3>
        <p className="text-gray-400 mb-6 max-w-xs mx-auto">
          Track your progress, set personal records, and achieve your fitness goals faster.
        </p>
        
        <Button
          onClick={onAddExerciseClick}
          className="w-full mb-6 gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 shadow-lg shadow-purple-900/20 active:scale-95 transition-all duration-200"
        >
          <Plus size={18} /> Add Exercise
        </Button>
        
        {onTemplateSelect && (
          <>
            <div className="text-sm text-gray-400 mb-3">Or quickly add a common exercise:</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickExercises.map((exercise, index) => (
                <motion.div
                  key={exercise}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 shadow-sm active:scale-95 transition-transform duration-150"
                    onClick={() => onTemplateSelect(exercise)}
                  >
                    {exercise}
                  </Button>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </Card>
  );
}
