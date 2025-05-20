
import React from 'react';
import { Button } from "@/components/ui/button";
import { StopCircle } from "lucide-react";
import { useWorkoutStore } from '@/store/workout';
import { toast } from '@/hooks/use-toast';

interface StopWorkoutButtonProps {
  onStopWorkout?: () => void;
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
  // Access the store directly to ensure we have the latest reset functionality
  const { resetSession } = useWorkoutStore();

  const handleStopWorkout = () => {
    // Confirm with the user before resetting
    if (window.confirm("Are you sure you want to reset this workout session? All progress will be lost.")) {
      // Call the resetSession function from the workout store
      resetSession();
      
      // Display a success message
      toast.success("Workout session reset successfully");
      
      // If an external handler was provided, call it as well
      if (onStopWorkout) {
        onStopWorkout();
      }
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleStopWorkout}
      className={`bg-red-900/50 border-red-600/30 text-white hover:bg-red-800/60 hover:text-white ${className}`}
    >
      <StopCircle className="h-4 w-4 mr-1" />
      Reset Workout
    </Button>
  );
};
