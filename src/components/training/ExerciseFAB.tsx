
import React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkoutStore } from "@/store/workout"; // Updated import path
import { CircularGradientButton } from "@/components/CircularGradientButton";

interface ExerciseFABProps {
  onClick?: () => void;
  onAddSet?: () => void;
  className?: string;
  visible?: boolean;
  showOnlyIfActive?: boolean;
  hideOnMobile?: boolean;
  floatingPosition?: boolean;
  position?: "bottom-right" | "bottom-center" | "top-right";
}

export const ExerciseFAB = ({ 
  onClick, 
  onAddSet,
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

  // Use onAddSet if provided, otherwise fall back to onClick
  const handleClick = onAddSet || onClick || (() => {});
  
  const positionClasses = {
    "bottom-right": "bottom-24 right-6",
    "bottom-center": "bottom-24 left-1/2 transform -translate-x-1/2",
    "top-right": "top-24 right-6"
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
        ariaLabel="Add exercise"
      >
        Add Exercise
      </CircularGradientButton>
    </div>
  );
};
