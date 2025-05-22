
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ExperienceGainProps {
  amount: number;
  trainingType?: string;
  previousLevel?: number;
  newLevel?: number;
}

// Toast function for XP display
export const showExperienceGain = ({ amount, trainingType, previousLevel, newLevel }: ExperienceGainProps) => {
  const isLevelUp = previousLevel !== undefined && newLevel !== undefined && newLevel > previousLevel;
  
  toast({
    title: isLevelUp ? `Level Up! ${previousLevel} → ${newLevel}` : `+${amount} XP`,
    description: trainingType 
      ? `Gained from ${trainingType} workout`
      : 'Gained from workout',
    variant: "default",
    duration: isLevelUp ? 5000 : 3000,
    className: isLevelUp ? 'bg-gradient-to-r from-amber-700 to-amber-500 text-amber-50' : undefined,
  });
};

// Interface for the overlay props
export interface ExperienceGainOverlayProps {
  amount: number;
  trainingType?: string;
  duration?: number;
  onComplete: () => void;
  className?: string;
  children?: React.ReactNode;
}

// Full screen overlay component
export const ExperienceGainOverlay: React.FC<ExperienceGainOverlayProps> = ({ 
  amount, 
  trainingType, 
  duration = 3000,
  onComplete,
  className = '',
  children 
}) => {
  const [show, setShow] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  
  // When this component mounts, start the auto-dismiss timer
  useEffect(() => {
    console.log("ExperienceGainOverlay: Component mounted");
    
    const id = window.setTimeout(() => {
      console.log("ExperienceGainOverlay: Duration timeout triggered, starting exit animation");
      setShow(false);
    }, duration);
    
    setTimeoutId(id as unknown as number);
    
    // Safety timeout - ensure we complete even if animation fails
    const safetyId = window.setTimeout(() => {
      console.log("ExperienceGainOverlay: Safety timeout triggered");
      if (!animationComplete) {
        console.warn("Animation didn't complete normally, forcing completion");
        handleAnimationComplete();
      }
    }, duration + 5000); // 5 seconds after normal timeout
    
    // Additional extreme safety timeout (last resort)
    const emergencyId = window.setTimeout(() => {
      console.log("ExperienceGainOverlay: EMERGENCY timeout triggered");
      if (!animationComplete) {
        console.error("Animation completely failed to complete, forcing emergency completion");
        try {
          setAnimationComplete(true);
          onComplete();
        } catch (error) {
          console.error("Failed to call onComplete in emergency timeout:", error);
        }
      }
    }, duration + 10000); // 10 seconds after normal timeout
    
    return () => {
      // Always clean up timeouts
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      window.clearTimeout(safetyId);
      window.clearTimeout(emergencyId);
      
      // If component unmounts before animation completes, ensure callback fires
      if (!animationComplete) {
        console.log("ExperienceGainOverlay: Component unmounted before animation completed, calling onComplete");
        try {
          onComplete();
        } catch (error) {
          console.error("Error in onComplete during unmount:", error);
        }
      }
    };
  }, [duration, animationComplete, onComplete]);
  
  // Handle animation complete state
  const handleAnimationComplete = () => {
    console.log("ExperienceGainOverlay: Animation completed, calling onComplete callback");
    
    // Prevent multiple calls
    if (animationComplete) {
      console.log("ExperienceGainOverlay: Animation already completed, skipping callback");
      return;
    }
    
    setAnimationComplete(true);
    
    try {
      // Call the callback to let parent know we're done
      if (typeof onComplete === 'function') {
        onComplete();
      } else {
        console.error("ExperienceGainOverlay: onComplete is not a function", onComplete);
      }
    } catch (error) {
      console.error("ExperienceGainOverlay: Error in onComplete callback", error);
      // Try to recover by forcing navigation
      try {
        window.location.href = '/';
      } catch (navError) {
        console.error("Failed to navigate after error:", navError);
      }
    }
  };
  
  return (
    <AnimatePresence onExitComplete={handleAnimationComplete}>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className={`fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 ${className}`}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.2, 1] 
              }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-yellow-500 p-3 rounded-full"
            >
              <Star className="h-8 w-8 text-white" />
            </motion.div>
            
            <div className="flex flex-col">
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-4xl font-bold text-yellow-400"
              >
                +{amount} XP
              </motion.h2>
              
              {trainingType && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/80 text-sm sm:text-base"
                >
                  {trainingType} training
                </motion.p>
              )}
            </div>
          </motion.div>
          
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
