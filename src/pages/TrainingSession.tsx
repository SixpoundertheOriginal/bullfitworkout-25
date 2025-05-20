
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';
import { useExercises } from "@/hooks/useExercises";
import { useTrainingSession } from "@/hooks/training-session";
import { TrainingSessionLoading } from "@/components/training/TrainingSessionLoading";
import { TrainingSessionContent } from "@/components/training/session/TrainingSessionContent";
import { WorkoutCompletion } from "@/components/training/WorkoutCompletion";
import { safeRenderableExercise } from "@/utils/exerciseAdapter";
import { validateWorkoutState } from '@/store/workout/actions';
import { toast } from '@/hooks/use-toast';
import { FloatingAddExerciseButton } from '@/components/training/FloatingAddExerciseButton';

const TrainingSessionPage = () => {
  const { isLoading: loadingExercises } = useExercises();
  const [showCompletion, setShowCompletion] = useState(false);
  const navigate = useNavigate();
  
  const {
    exercises,
    elapsedTime,
    hasExercises,
    resetSession,
    handleFinishWorkout,
    isSaving,
    workoutStatus,
    setIsAddExerciseSheetOpen
  } = useTrainingSession();

  // Initialize the workout timer
  useWorkoutTimer();
  
  // Validate workout state when page loads
  useEffect(() => {
    console.log("TrainingSessionPage: Running state validation");
    // Validate with slight delay to ensure store is hydrated
    const timer = setTimeout(() => {
      const isValid = validateWorkoutState();
      if (!isValid) {
        toast.warning("Workout session was reset due to data inconsistency", {
          description: "Start a new workout to continue"
        });
      }
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Detect inconsistent state
  useEffect(() => {
    const exerciseKeys = Object.keys(exercises);
    
    // Check for active workout with no exercises
    if (workoutStatus === 'active' && exerciseKeys.length === 0) {
      console.warn("TrainingSessionPage: Detected inconsistent state");
      toast({
        title: "Workout data inconsistency detected",
        description: "Workout appears to be active but has no exercises",
        variant: "destructive",
        action: {
          label: "Reset",
          onClick: () => resetSession()
        }
      });
    }
  }, [workoutStatus, exercises, resetSession]);

  if (loadingExercises) {
    return <TrainingSessionLoading />;
  }

  // Wrapper for finish workout
  const handleFinishWorkoutClick = async () => {
    try {
      if (!hasExercises || Object.keys(exercises).length === 0) {
        return;
      }
      
      // Show completion screen
      setShowCompletion(true);
    } catch (error) {
      console.error("Error while finishing workout:", error);
    }
  };

  // Handle completion screens
  const handleWorkoutComplete = () => {
    console.log("Saving workout data...");
    handleFinishWorkout()
      .then((result) => {
        console.log("Workout saved with result:", result);
        // Add a small delay to show success message before redirecting
        setTimeout(() => {
          resetSession();
          setShowCompletion(false);
          // Navigate to home page after successful completion
          navigate('/');
        }, 300);
      })
      .catch((error) => {
        console.error("Error saving workout:", error);
        // Even on error, navigate back to home page to prevent user getting stuck
        setTimeout(() => {
          navigate('/');
        }, 1000);
      });
  };

  // Quick handler to open add exercise sheet from anywhere
  const handleOpenAddExercise = () => {
    setIsAddExerciseSheetOpen(true);
  };

  // If showing completion modal, render that instead
  if (showCompletion) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white pt-16 pb-4">
        <main className="flex-1 overflow-auto px-4">
          <div className="container max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold my-6 text-center">Workout Complete</h1>
            
            <WorkoutCompletion
              exercises={exercises}
              duration={elapsedTime}
              intensity={7}
              efficiency={8}
              onComplete={handleWorkoutComplete}
            />
          </div>
        </main>
      </div>
    );
  }

  // Empty state detector for global floating button
  const isEmptyState = Object.keys(exercises).length === 0;

  return (
    <>
      <TrainingSessionContent 
        onFinishWorkoutClick={handleFinishWorkoutClick}
        isSaving={isSaving}
      />
      
      {/* Global floating add exercise button that appears on empty state */}
      {isEmptyState && (
        <FloatingAddExerciseButton 
          onClick={handleOpenAddExercise}
          className="md:hidden" // Show only on mobile for empty state
        />
      )}
    </>
  );
};

export default TrainingSessionPage;
