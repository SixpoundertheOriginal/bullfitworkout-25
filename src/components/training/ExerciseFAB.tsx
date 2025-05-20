
import React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkoutStore } from "@/store/workout"; // Updated import path
import { CircularGradientButton } from "@/components/CircularGradientButton";

interface ExerciseFABProps {
  onAddSet?: () => void;
  onClick?: () => void;
  className?: string;
  visible?: boolean;
  showOnlyIfActive?: boolean;
  hideOnMobile?: boolean;
  floatingPosition?: boolean;
  position?: "bottom-right" | "bottom-center";
}

export const ExerciseFAB = ({ 
  onAddSet,
  onClick,
  className, 
  visible = true,
  showOnlyIfActive = false,
  hideOnMobile = true,
  floatingPosition = true,
  position = "bottom-right"
}: ExerciseFABProps) => {
  const { isActive } = useWorkoutStore();
  
  // Option to only show when workout is active
  if (showOnlyIfActive && !isActive) {
    return null;
  }
  
  const handleClick = () => {
    console.log('ExerciseFAB: Click handler called');
    
    // Use onAddSet for backward compatibility, but prefer onClick if provided
    if (onClick) {
      console.log('ExerciseFAB: Calling onClick handler');
      onClick();
    } else if (onAddSet) {
      console.log('ExerciseFAB: Calling onAddSet handler');
      onAddSet();
    } else {
      console.log('ExerciseFAB: No click handler provided');
    }
  };

  const positionClasses = {
    "bottom-right": "bottom-24 right-6",
    "bottom-center": "bottom-24 left-1/2 -translate-x-1/2"
  };
  
  return (
    <div className={cn(
      floatingPosition ? `fixed ${positionClasses[position]} z-50` : "relative", 
      "transform transition-all duration-300 ease-in-out",
      visible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0 pointer-events-none",
      hideOnMobile ? "hidden md:block" : "",
      className
    )}>
      <CircularGradientButton
        onClick={handleClick}
        icon={<Plus size={24} className="text-white" />}
        size={56}
        ariaLabel="Add set or exercise"
      />
    </div>
  );
};
