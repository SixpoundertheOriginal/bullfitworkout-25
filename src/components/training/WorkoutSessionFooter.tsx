
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface WorkoutSessionFooterProps {
  onAddExercise: () => void;
  onFinishWorkout: () => void;
  hasExercises: boolean;
  isSaving: boolean;
}

export const WorkoutSessionFooter: React.FC<WorkoutSessionFooterProps> = ({
  onAddExercise,
  onFinishWorkout,
  hasExercises,
  isSaving
}) => {
  // Add haptic feedback for touch interactions
  const handleButtonPress = (callback: () => void) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    callback();
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        // Base positioning
        "sticky bottom-0 left-0 right-0 z-40",
        // Sizing and padding - standardized height
        "px-4 py-3",
        // Visual styling with glass effect
        "bg-black/90 backdrop-blur-lg",
        // Safe area support - improved handling
        "safe-bottom",
        // Border styling
        "border-t border-white/5",
        // Shadow for depth
        "shadow-lg shadow-black/40",
        // Height for better touch targets - increased to match header
        "h-16 md:h-[68px]"
      )}
    >
      <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto h-full justify-center">
        <Button
          onClick={() => handleButtonPress(onAddExercise)}
          className={cn(
            // Size and layout - increased height for better touch
            "w-full h-full py-3 flex items-center justify-center gap-2",
            // Visual styling
            "bg-gradient-to-r from-blue-600 to-purple-600",
            "hover:from-blue-700 hover:to-purple-700",
            "text-white font-semibold rounded-full",
            // Shadow effects
            "shadow-lg hover:shadow-xl shadow-blue-900/20 hover:shadow-blue-900/30",
            // Animations and interactions
            "transition-all duration-200",
            "active:scale-95",
            "tap-highlight-transparent"
          )}
          aria-label="Add exercise"
        >
          <Plus size={20} />
          Add Exercise
        </Button>

        {hasExercises && (
          <Button
            onClick={() => handleButtonPress(onFinishWorkout)}
            disabled={isSaving}
            aria-label="Finish workout"
            className={cn(
              // Size and layout - increased height for better touch
              "w-full h-full py-3 flex items-center justify-center gap-2",
              // Visual styling
              "bg-gradient-to-r from-purple-600 to-pink-500",
              "hover:from-purple-700 hover:to-pink-600",
              "text-white font-semibold rounded-full",
              // Shadow effects
              "shadow-lg hover:shadow-xl shadow-purple-900/20 hover:shadow-purple-900/30",
              // Animations and interactions
              "transition-all duration-200",
              "animate-fade-in",
              "active:scale-95",
              "tap-highlight-transparent",
              isSaving && "opacity-90"
            )}
          >
            {isSaving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Finish Workout
              </>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
};
