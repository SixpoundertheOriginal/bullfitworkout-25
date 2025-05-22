
import React from 'react';
import { Plus, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface FloatingAddExerciseButtonProps {
  onClick: () => void;
  className?: string;
  visible?: boolean;
  label?: string;
  showIcon?: boolean;
}

export const FloatingAddExerciseButton: React.FC<FloatingAddExerciseButtonProps> = ({
  onClick,
  className,
  visible = true,
  label = "Add Exercise",
  showIcon = true
}) => {
  if (!visible) return null;
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "fixed bottom-24 right-6 z-50",
        className
      )}
    >
      <Button 
        onClick={onClick} 
        variant="default"
        className={cn(
          label ? "h-12 px-4 rounded-full shadow-lg" : "h-14 w-14 rounded-full shadow-lg",
          "bg-gradient-to-r from-indigo-600 to-purple-600",
          "hover:from-indigo-500 hover:to-purple-500",
          "transition-all duration-300 hover:scale-110",
          "border border-indigo-400/20 shadow-indigo-900/30"
        )}
      >
        {showIcon && <Plus className={cn("h-6 w-6", label && "mr-2")} />}
        {label && <span>{label}</span>}
      </Button>
    </motion.div>
  );
};

export const FloatingAddButton: React.FC<FloatingAddExerciseButtonProps> = (props) => {
  return <FloatingAddExerciseButton {...props} />;
};

export const FloatingLibraryButton: React.FC<FloatingAddExerciseButtonProps> = ({
  onClick,
  className,
  visible = true,
}) => {
  if (!visible) return null;
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "fixed bottom-24 right-6 z-50",
        className
      )}
    >
      <Button 
        onClick={onClick} 
        variant="default"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg",
          "bg-gradient-to-r from-purple-600 to-indigo-600",
          "hover:from-purple-500 hover:to-indigo-500",
          "transition-all duration-300 hover:scale-110",
          "border border-purple-400/20 shadow-purple-900/30"
        )}
      >
        <Dumbbell className="h-6 w-6" />
      </Button>
    </motion.div>
  );
};
