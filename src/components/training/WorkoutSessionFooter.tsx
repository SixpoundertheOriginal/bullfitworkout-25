
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle, Target, ArrowLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from "@/hooks/use-toast";
import { SafeExerciseName } from '@/components/exercises/SafeExerciseName';

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
  onCompleteExercise?: () => void; // Added prop for completing the exercise
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
  hasMoreExercises = false,
  onCompleteExercise
}) => {
  const isMobile = useIsMobile();
  
  // If not visible, don't render
  if (!visible) {
    return null;
  }

  // Only truncate long exercise names
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
        "w-full rounded-xl my-3",
        focusedExercise 
          ? "bg-gradient-to-br from-purple-900/30 via-black/80 to-black/90 border border-purple-500/20" 
          : "bg-gradient-to-br from-gray-900/80 via-black/80 to-black/90 border border-gray-800/30",
        "shadow-lg p-3 sm:p-4"
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
                  className="text-white/70 hover:text-white transition-colors p-1 sm:p-2"
                  onClick={onExitFocus}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  <span className="text-xs sm:text-sm">Back</span>
                </Button>
                
                {hasMoreExercises && onNextExercise && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/70 hover:text-white transition-colors p-1 sm:p-2"
                    onClick={onNextExercise}
                  >
                    <span className="text-xs sm:text-sm">Next</span>
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.02, 1] }}
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
                    "w-full py-3 text-base sm:text-lg font-medium sm:font-semibold"
                  )}
                  onClick={() => {
                    if (onCompleteExercise) {
                      onCompleteExercise();
                    } else if (onExitFocus) {
                      onExitFocus();
                      toast({
                        title: `${focusedExercise} completed!`,
                        variant: "default"
                      });
                    }
                  }}
                >
                  {isSaving ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="flex flex-col items-start">
                        <span className="text-xs font-normal text-white/80">Complete Exercise</span>
                        <SafeExerciseName 
                          exercise={focusedExercise} 
                          maxLength={20}
                          className="font-medium text-sm sm:text-base"
                        />
                      </span>
                    </>
                  )}
                </Button>
              </motion.div>
            </>
          ) : (
            <div className={cn(
              "flex justify-between items-center gap-2",
              isMobile ? "flex-col" : "flex-row"
            )}>
              <Button
                className={cn(
                  "bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white shadow-lg",
                  "border border-indigo-500/20 transition-all duration-300",
                  "h-10 sm:h-11 py-2", // Adjusted height for better touchability
                  isMobile ? "w-full text-sm" : ""
                )}
                onClick={onAddExercise}
              >
                <Plus className="mr-1 h-4 w-4" /> Add Exercise
              </Button>
              
              {hasExercises && (
                <Button
                  disabled={isSaving}
                  className={cn(
                    "bg-gradient-to-r",
                    "h-10 sm:h-11 py-2", // Adjusted height for better touchability
                    "from-green-600 to-emerald-800 hover:from-green-700 hover:to-emerald-900 text-white shadow-lg border border-green-500/20",
                    "transition-all duration-300",
                    isMobile ? "w-full text-sm" : ""
                  )}
                  onClick={() => {
                    console.log('Finish Workout button clicked!');
                    if (!isSaving && onFinishWorkout) {
                      onFinishWorkout();
                    }
                  }}
                >
                  {isSaving ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Finish Workout
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WorkoutSessionFooter;
