
import React from 'react';
import { Button } from "@/components/ui/button";
import { StopCircle } from "lucide-react";

interface StopWorkoutButtonProps {
  onStopWorkout: () => void;
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const StopWorkoutButton: React.FC<StopWorkoutButtonProps> = ({
  onStopWorkout,
  variant = 'outline',
  size = 'sm',
  className = ''
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onStopWorkout}
      className={`bg-red-900/50 border-red-600/30 text-white hover:bg-red-800/60 hover:text-white ${className}`}
    >
      <StopCircle className="h-4 w-4 mr-1" />
      End Workout
    </Button>
  );
};
