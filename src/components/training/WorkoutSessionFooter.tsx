
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle, Target, ArrowLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from "@/hooks/use-toast";

interface WorkoutSessionFooterProps {
  onAddExercise: () => void;
  onFinishWorkout: () => void;
  hasExercises: boolean;
  isSaving: boolean;
  focusedExercise?: string | null;
  onExitFocus?: () => void;
  visible?: boolean;
  onNextExercise?: () => void;
  hasMoreExercises?: boolean;
}

export const WorkoutSessionFooter: React.FC<WorkoutSessionFooterProps> = ({
  onAddExercise,
  onFinishWorkout,
  hasExercises,
  isSaving,
  focusedExercise,
  onExitFocus,
  visible = true,
  onNextExercise,
  hasMoreExercises = false
}) => {
  const isMobile = useIsMobile();
  
  // If not visible and no exercises, don't render
  if (!visible && !hasExercises) {
    return null;
  }

  // Truncate exercise name if too long
  const truncateExerciseName = (name: string | null | undefined, maxLength: number = 20) => {
    if (!name) return "";
    return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
  };
  
  const truncatedExerciseName = truncateExerciseName(focusedExercise);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "w-full rounded-xl my-4",
        focusedExercise 
          ? "bg-gradient-to-br from-purple-900/30 via-black/80 to-black/90 border border-purple-500/20" 
          : "bg-gradient-to-br from-gray-900/80 via-black/80 to-black/90 border border-gray-800/30",
        "shadow-lg p-4"
      )}
    >
      <div className="container max-w-5xl mx-auto">
        <div className={cn(
          "flex flex-col gap-2",
          isMobile && focusedExercise ? "space-y-2" : ""
        )}>
          {focusedExercise ? (
            <>
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost" 
                  size="sm"
                  className="text-white/70 hover:text-white transition-colors"
                  onClick={onExitFocus}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Workout
                </Button>
                
                {hasMoreExercises && onNextExercise && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/70 hover:text-white transition-colors"
                    onClick={onNextExercise}
                  >
                    Next Exercise
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ 
                  repeat: Infinity, 
                  repeatType: "reverse", 
                  duration: 2,
                  ease: "easeInOut" 
                }}
              >
                <Button
                  disabled={isSaving}
                  className={cn(
                    "bg-gradient-to-r from-green-600 to-emerald-800",
                    "hover:from-green-700 hover:to-emerald-900 text-white shadow-lg shadow-green-900/30",
                    "border border-green-500/30 transition-all duration-300",
                    "w-full py-4 text-lg font-semibold"
                  )}
                  onClick={() => {
                    if (onExitFocus) onExitFocus();
                    toast.success(`${focusedExercise} completed!`);
                  }}
                >
                  {isSaving ? (
                    <>
                      <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-3 h-5 w-5" />
                      <span className="flex flex-col items-start">
                        <span className="text-sm font-normal text-white/80">Complete Exercise</span>
                        <span className="font-semibold">{truncatedExerciseName}</span>
                      </span>
                    </>
                  )}
                </Button>
              </motion.div>
            </>
          ) : (
            <div className={cn(
              "flex justify-between items-center gap-3",
              isMobile && "flex-col"
            )}>
              <Button
                className={cn(
                  "bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white shadow-lg",
                  "border border-indigo-500/20 transition-all duration-300",
                  "h-12 py-2", // Increased height for better touchability
                  isMobile && "w-full"
                )}
                onClick={onAddExercise}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Exercise
              </Button>
              
              <Button
                disabled={!hasExercises || isSaving}
                className={cn(
                  "bg-gradient-to-r",
                  "h-12 py-2", // Increased height for better touchability
                  hasExercises 
                    ? "from-green-600 to-emerald-800 hover:from-green-700 hover:to-emerald-900 text-white shadow-lg border border-green-500/20" 
                    : "from-gray-700 to-gray-800 text-gray-300 cursor-not-allowed opacity-70",
                  "transition-all duration-300",
                  isMobile ? "w-full" : ""
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
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WorkoutSessionFooter;
