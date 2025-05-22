
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface FloatingAddExerciseButtonProps {
  onClick: () => void;
  className?: string;
  visible?: boolean;
}

export const FloatingAddExerciseButton: React.FC<FloatingAddExerciseButtonProps> = ({
  onClick,
  className,
  visible = true
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
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg",
          "bg-gradient-to-r from-indigo-600 to-purple-600",
          "hover:from-indigo-500 hover:to-purple-500",
          "transition-all duration-300 hover:scale-110",
          "border border-indigo-400/20 shadow-indigo-900/30"
        )}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </motion.div>
  );
};
