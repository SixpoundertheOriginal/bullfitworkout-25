
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '@/store/workout';
import { toast } from '@/hooks/use-toast';

interface TrainingStartButtonProps {
  trainingType?: string;
  label?: string;
  onClick?: () => void;
  altMode?: boolean;
}

export const StartTrainingButton: React.FC<TrainingStartButtonProps> = ({ 
  trainingType = "strength",
  label = "Start Training",
  onClick,
  altMode = false
}) => {
  const navigate = useNavigate();
  const { isActive, lastActiveRoute } = useWorkoutStore();
  
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
      return;
    }

    // Check if a workout is already active
    if (isActive && lastActiveRoute) {
      console.log('StartTrainingButton: Existing workout found, navigating to', lastActiveRoute);
      navigate(lastActiveRoute);
      toast({
        title: "Resuming workout",
        description: "Continuing your active workout session"
      });
      return;
    }
    
    // Navigate to setup wizard for new workouts
    console.log('StartTrainingButton: No active workout, navigating to setup-workout');
    navigate('/setup-workout', {
      state: {
        suggestedType: trainingType
      }
    });
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
        aria-label={isActive ? "Resume training" : "Start training"}
      >
        <Dumbbell size={20} />
        {isActive ? "Resume Workout" : label}
      </Button>
    </motion.div>
  );
};
