
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CircularGradientButton } from '@/components/CircularGradientButton';
import { cn } from '@/lib/utils';

interface ExerciseCompletionConfirmationProps {
  isOpen: boolean;
  exerciseName: string;
  onClose: () => void;
  onNextExercise: () => void;
  hasNext: boolean;
}

export const ExerciseCompletionConfirmation: React.FC<ExerciseCompletionConfirmationProps> = ({
  isOpen,
  exerciseName,
  onClose,
  onNextExercise,
  hasNext
}) => {
  if (!isOpen) return null;
  
  // Truncate exercise name if too long
  const truncatedName = exerciseName.length > 25 
    ? `${exerciseName.substring(0, 25)}...` 
    : exerciseName;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-3xl border border-white/10 shadow-xl w-[90%] max-w-md"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <CircularGradientButton
                size={80}
                className="bg-gradient-to-r from-green-500 to-emerald-600 mb-6"
                icon={<CheckCircle size={32} className="text-white" />}
                ariaLabel="Exercise completed"
              />
              
              <h3 className="text-xl font-bold mb-2 text-white">Exercise Completed!</h3>
              <p className="text-white/80 mb-6">{truncatedName}</p>
              
              <div className="w-full space-y-3">
                {hasNext && (
                  <Button
                    className={cn(
                      "w-full py-6 text-lg font-medium",
                      "bg-gradient-to-r from-purple-600 to-purple-800",
                      "hover:from-purple-700 hover:to-purple-900 text-white",
                      "border border-white/10 shadow-lg"
                    )}
                    onClick={() => {
                      onClose();
                      onNextExercise();
                    }}
                  >
                    Next Exercise
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="w-full bg-transparent border border-white/20 text-white/90 hover:bg-white/10"
                  onClick={onClose}
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExerciseCompletionConfirmation;
