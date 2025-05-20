
import React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkoutStore } from "@/store/workout"; // Updated import path
import { CircularGradientButton } from "@/components/CircularGradientButton";

interface ExerciseFABProps {
  onClick: () => void;
  className?: string;
  visible?: boolean;
  showOnlyIfActive?: boolean;
  hideOnMobile?: boolean;
  floatingPosition?: boolean;
}

export const ExerciseFAB = ({ 
  onClick, 
  className, 
  visible = true,
  showOnlyIfActive = false,
  hideOnMobile = true,
  floatingPosition = true
}: ExerciseFABProps) => {
  const { isActive } = useWorkoutStore();
  
  // Add click handler with logging
  const handleClick = () => {
    console.log("ExerciseFAB: Button clicked");
    onClick();
  };
  
  // Option to only show when workout is active
  if (showOnlyIfActive && !isActive) {
    return null;
  }
  
  return (
    <div className={cn(
      floatingPosition ? "fixed bottom-24 right-6 z-50" : "relative", 
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
