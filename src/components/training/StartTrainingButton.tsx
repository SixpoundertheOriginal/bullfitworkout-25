import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';

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
  
  const handleStart = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    if (onClick) {
      onClick();
    }

    if (altMode) {
      navigate('/setup-workout');
      return;
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
