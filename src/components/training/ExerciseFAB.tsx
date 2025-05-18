
import React from 'react';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useHaptics } from '@/hooks/use-haptics';

interface ExerciseFABProps {
  visible: boolean;
  onAddSet?: () => void;
  position?: 'bottom-right' | 'bottom-center';
  className?: string;
}

export const ExerciseFAB: React.FC<ExerciseFABProps> = ({
  visible,
  onAddSet,
  position = 'bottom-center',  // Changed default to bottom-center
  className
}) => {
  const { triggerHaptic } = useHaptics();
  
  const positionClasses = {
    'bottom-right': 'bottom-24 right-4',
    'bottom-center': 'bottom-24 left-1/2 -translate-x-1/2'
  };
  
  const handleClick = () => {
    triggerHaptic('medium');
    if (onAddSet) onAddSet();
  };
  
  return (
    <AnimatePresence>
      {visible && onAddSet && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={cn(
            'fixed z-50',
            positionClasses[position],
            className
          )}
        >
          <Button
            size="lg"
            onClick={handleClick}
            className={cn(
              'h-14 px-6 rounded-full shadow-lg',
              'bg-gradient-to-r from-purple-600 to-indigo-600',
              'border border-purple-500/20',
              'hover:from-purple-500 hover:to-indigo-500',
              'active:scale-95 transition-all duration-200'
            )}
          >
            <Plus className="h-5 w-5 mr-2" />
            <span className="font-medium">Add Set</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
