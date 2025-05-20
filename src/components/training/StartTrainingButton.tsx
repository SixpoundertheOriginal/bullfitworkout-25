
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '@/store/workout/store';
import { toast } from '@/hooks/use-toast';

interface TrainingStartButtonProps {
  trainingType?: string;
  label?: string;
  onClick?: () => void;
  altMode?: boolean;
}

export const TrainingStartButton: React.FC<TrainingStartButtonProps> = ({ 
  trainingType = "strength",
  label = "Start Training",
  onClick,
  altMode = false
}) => {
  const navigate = useNavigate();
  const { startWorkout, updateLastActiveRoute } = useWorkoutStore();
  
  const handleStart = () => {
    console.log('StartTrainingButton: handleStart called');
    
    // Give haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    // Call the onClick handler if provided
    if (onClick) {
      console.log('StartTrainingButton: Calling provided onClick handler');
      onClick();
    }

    // If in alt mode, navigate to setup screen instead
    if (altMode) {
      console.log('StartTrainingButton: Using alt mode, navigating to setup-workout');
      navigate('/setup-workout');
      return;
    }
    
    try {
      console.log('StartTrainingButton: Starting workout via store');
      
      // Start workout in the central store
      startWorkout();
      
      // Update the last active route
      updateLastActiveRoute('/training-session');
      
      console.log('StartTrainingButton: Navigating to training-session');
      
      // Navigate to the training session page
      navigate('/training-session');
      
      // Notify the user
      toast({
        title: "Workout started! Add exercises to begin tracking"
      });
    } catch (error) {
      console.error('StartTrainingButton: Error starting workout:', error);
      toast({
        title: "Error starting workout",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <Button
        onClick={handleStart}
        className={cn(
          // Size and layout - increased height for better touch
          "w-full h-14 py-3 flex items-center justify-center gap-2",
          // Visual styling
          "bg-gradient-to-r from-purple-600 to-pink-500",
          "hover:from-purple-700 hover:to-pink-600",
          "text-white font-semibold rounded-full",
          // Shadow effects
          "shadow-lg hover:shadow-xl shadow-purple-900/20 hover:shadow-purple-900/30",
          // Animations and interactions
          "transition-all duration-200",
          "active:scale-95",
          "tap-highlight-transparent"
        )}
        aria-label="Start training"
      >
        <Dumbbell size={20} />
        {label}
      </Button>
    </motion.div>
  );
};
