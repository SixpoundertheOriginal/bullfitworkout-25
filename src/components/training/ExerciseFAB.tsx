
import React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { CircularGradientButton } from "@/components/CircularGradientButton";

interface ExerciseFABProps {
  visible?: boolean;
  onAddSet?: () => void;
  onClick?: () => void;
  className?: string;
  position?: "bottom-right" | "bottom-center";
  label?: string;
}

export const ExerciseFAB = ({ 
  visible = true, 
  onAddSet,
  onClick,
  className,
  position = "bottom-right",
  label = "Add Set"
}: ExerciseFABProps) => {
  // Handler that uses either addSet or onClick
  const handleClick = () => {
    if (onAddSet) {
      onAddSet();
    } else if (onClick) {
      onClick();
    }
  };

  const positionClasses = {
    "bottom-right": "fixed bottom-24 right-6",
    "bottom-center": "fixed bottom-24 left-1/2 transform -translate-x-1/2"
  };
  
  return (
    <div className={cn(
      positionClasses[position], 
      "z-50 transform transition-all duration-300 ease-in-out",
      visible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0 pointer-events-none",
      className
    )}>
      <CircularGradientButton
        onClick={handleClick}
        icon={<Plus size={24} className="text-white" />}
        size={56}
        ariaLabel={label}
      >
        {label}
      </CircularGradientButton>
    </div>
  );
};
