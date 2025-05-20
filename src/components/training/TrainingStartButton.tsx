
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { CircularGradientButton } from '@/components/CircularGradientButton';
import { cn } from '@/lib/utils';
import { useWorkoutStore } from '@/store/workout/store';
import { toast } from '@/hooks/use-toast';

interface TrainingStartButtonProps {
  onStartClick?: () => void;
  className?: string;
  label?: string;
  size?: number;
}

export const TrainingStartButton = ({
  onStartClick,
  className = '',
  label = 'Start Training',
  size = 120,
}: TrainingStartButtonProps) => {
  const navigate = useNavigate();
  const { isActive, startWorkout, updateLastActiveRoute } = useWorkoutStore();
  
  const handleStartClick = () => {
    console.log('TrainingStartButton: handleStartClick called');
    
    // Call the provided click handler if any
    if (onStartClick) {
      console.log('TrainingStartButton: Calling provided onStartClick');
      onStartClick();
      return;
    }
    
    try {
      console.log('TrainingStartButton: Starting workout via store');
      
      // Start the workout with our workout state manager
      startWorkout();
      
      // Update last active route for tracking
      updateLastActiveRoute('/training-session');
      
      console.log('TrainingStartButton: Navigating to training-session');
      
      // Navigate to the training session page
      navigate('/training-session');
      
      // Show success toast
      toast({
        title: "Workout started! Add exercises to begin"
      });
    } catch (error) {
      console.error('TrainingStartButton: Error starting workout:', error);
      toast({
        title: "Error starting workout",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };
  
  // Don't render this button if a workout is already active
  if (isActive) {
    console.log('TrainingStartButton: Not rendering - workout already active');
    return null;
  }
  
  return (
    <CircularGradientButton
      onClick={handleStartClick}
      className={cn("hover:scale-105 transition-transform", className)}
      icon={<Play size={40} className="text-white ml-1" />}
      size={size}
    >
      {label}
    </CircularGradientButton>
  );
};
