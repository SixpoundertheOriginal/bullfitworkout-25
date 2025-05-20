
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";

interface FloatingAddExerciseButtonProps {
  onClick: () => void;
  className?: string;
}

export const FloatingAddExerciseButton: React.FC<FloatingAddExerciseButtonProps> = ({
  onClick,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Reset click state after animation
  useEffect(() => {
    if (isClicked) {
      const timer = setTimeout(() => {
        setIsClicked(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isClicked]);

  // Enhanced click handler with visual feedback
  const handleClick = () => {
    console.log('FloatingAddExerciseButton: Button clicked');
    setIsClicked(true);
    onClick();
    
    // Add a delayed verification log
    setTimeout(() => {
      console.log('FloatingAddExerciseButton: Verification check 100ms after click');
    }, 100);
  };

  return (
    <motion.div 
      className={cn(
        "fixed bottom-24 right-8 z-[100]", // Increased z-index
        className
      )}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Button
        onClick={handleClick}
        size="lg"
        variant="gradient"
        className={cn(
          "rounded-full p-6 shadow-lg transition-all duration-300",
          "bg-gradient-to-r from-purple-600 to-pink-500",
          "hover:from-purple-500 hover:to-pink-400",
          "shadow-purple-500/30 hover:shadow-purple-500/40",
          "border border-purple-500/20",
          "flex items-center justify-center gap-2",
          isHovered ? "scale-110" : "scale-100",
          isClicked ? "scale-90" : "" // Add a press effect
        )}
      >
        <Plus className="h-6 w-6 text-white" />
        <AnimatePresence>
          {isHovered && (
            <motion.span
              className="text-white font-medium"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              Add Exercise
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      {/* Glowing effect that appears on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              background: "radial-gradient(circle at center, rgba(168,85,247,0.4) 0%, transparent 70%)",
              filter: "blur(15px)",
              zIndex: -1,
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
