
import React from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AddExerciseButtonProps {
  onClick: () => void;
  className?: string;
  label?: string;
  isActive?: boolean;
}

export const AddExerciseButton: React.FC<AddExerciseButtonProps> = ({
  onClick,
  className = '',
  label = 'Add Exercise',
  isActive = true,
}) => {
  // Do nothing if button is not active
  const handleClick = () => {
    console.log('AddExerciseButton: handleClick called');
    
    // Give haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    if (isActive) {
      console.log('AddExerciseButton: Executing onClick handler');
      onClick();
    } else {
      console.log('AddExerciseButton: Button is not active, ignoring click');
    }
  };
  
  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "w-full flex items-center justify-center gap-3 py-4 px-5 rounded-xl",
        "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600",
        "text-white font-semibold text-lg",
        "shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30",
        "transition-all duration-300 ease-out",
        "focus:ring-2 focus:ring-purple-400 focus:outline-none",
        className
      )}
    >
      <span className="bg-white/20 rounded-full p-1">
        <Plus className="h-6 w-6" />
      </span>
      {label}
    </motion.button>
  );
};
