
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle, Target } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from '@/hooks/use-mobile';

interface WorkoutSessionFooterProps {
  onAddExercise: () => void;
  onFinishWorkout: () => void;
  hasExercises: boolean;
  isSaving: boolean;
  focusedExercise?: string | null;
  onExitFocus?: () => void;
}

export const WorkoutSessionFooter: React.FC<WorkoutSessionFooterProps> = ({
  onAddExercise,
  onFinishWorkout,
  hasExercises,
  isSaving,
  focusedExercise,
  onExitFocus
}) => {
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50", // High z-index to stay on top
        "bg-gradient-to-t from-black via-black/95 to-black/0 pt-8 pb-6 px-4 mt-16", // Added top margin
        "border-t border-gray-800/30", // Added subtle border for separation
        focusedExercise ? "from-purple-900/20 via-black/95 to-black/0" : ""
      )}
      style={{ 
        position: "fixed", // Ensure it's fixed at the bottom
        bottom: 0,
        width: "100%"
      }}
    >
      <div className="container max-w-5xl mx-auto">
        <div className={cn(
          "flex justify-between items-center gap-3",
          isMobile && focusedExercise && "flex-col gap-2"
        )}>
          {focusedExercise ? (
            <Button
              disabled={isSaving}
              className={cn(
                "bg-gradient-to-r from-purple-600 to-purple-800",
                "hover:from-purple-700 hover:to-purple-900 text-white shadow-lg shadow-purple-900/30",
                "border border-purple-500/30 transition-all duration-300",
                isMobile ? "w-full" : "flex-1"
              )}
              onClick={onFinishWorkout}
            >
              {isSaving ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Complete "{focusedExercise}"
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                className={cn(
                  "bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white shadow-lg",
                  isMobile && "flex-1"
                )}
                onClick={onAddExercise}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Exercise
              </Button>
              
              <Button
                disabled={!hasExercises || isSaving}
                className={cn(
                  "bg-gradient-to-r",
                  hasExercises 
                    ? "from-green-600 to-emerald-800 hover:from-green-700 hover:to-emerald-900 text-white shadow-lg" 
                    : "from-gray-700 to-gray-800 text-gray-300 cursor-not-allowed opacity-70",
                  isMobile ? "flex-1" : "ml-0"
                )}
                onClick={onFinishWorkout}
              >
                {isSaving ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Finish Workout
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WorkoutSessionFooter;
