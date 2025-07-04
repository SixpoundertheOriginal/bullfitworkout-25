
import React from "react";
import { CircularGradientButton } from "@/components/CircularGradientButton";
import { useWorkoutState } from "@/hooks/useWorkoutState";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface TrainingStartButtonProps {
  onStartClick?: () => void;
  className?: string;
  label?: string;
  size?: number;
}

export const TrainingStartButton: React.FC<TrainingStartButtonProps> = ({
  onStartClick,
  className,
  label = "Start",
  size = 140, // Increased default size
}) => {
  const { isActive, lastActiveRoute } = useWorkoutState();
  const navigate = useNavigate();
  
  // Default handler if onStartClick is not provided
  const handleStartClick = () => {
    if (onStartClick) {
      onStartClick();
    } else {
      // Always route to setup-workout for workout initialization
      navigate('/setup-workout');
    }
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative"
      >
        {/* Halo effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-pink-500/20 rounded-full blur-lg opacity-70"></div>
        
        <CircularGradientButton
          onClick={handleStartClick}
          size={size}
          ariaLabel="Start training session"
          icon={<Trophy size={size * 0.35} className="text-white" />}
        >
          {isActive ? "Resume" : label}
        </CircularGradientButton>
      </motion.div>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-sm text-white/70"
      >
        {isActive ? "Continue your workout" : "Begin your fitness journey"}
      </motion.p>
      
      {isActive && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-1 text-xs text-purple-400/80"
        >
          Session in progress
        </motion.p>
      )}
    </div>
  );
};
