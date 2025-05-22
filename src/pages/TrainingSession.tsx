
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

const TrainingSessionPage = () => {
  const { isLoading: loadingExercises } = useExercises();
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionInitiated, setCompletionInitiated] = useState(false);
  const navigate = useNavigate();
  
  const {
    exercises,
    elapsedTime,
    hasExercises,
    resetSession,
    handleFinishWorkout,
    isSaving,
    workoutStatus,
    setIsAddExerciseSheetOpen,
    isActive
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

  // Safety effect to monitor completion state
  useEffect(() => {
    if (completionInitiated && !showCompletion && !isSaving && isActive) {
      console.warn("Workout completion was initiated but workout is still active");
      toast({
        title: "Workout completion issue detected",
        description: "The workout completion process may have stalled",
        variant: "destructive",
        action: {
          label: "Force Reset",
          onClick: () => {
            resetSession();
            navigate('/');
          }
        }
      });
    }
  }, [completionInitiated, showCompletion, isSaving, isActive]);

  if (loadingExercises) {
    return <TrainingSessionLoading />;
  }

  // Wrapper for finish workout
  const handleFinishWorkoutClick = async () => {
    try {
      if (!hasExercises || Object.keys(exercises).length === 0) {
        return;
      }
      
      // Mark completion as initiated for tracking
      setCompletionInitiated(true);
      
      // Show completion screen
      setShowCompletion(true);
      
      console.log("Workout completion view shown, workout status:", workoutStatus);
    } catch (error) {
      console.error("Error while finishing workout:", error);
    }
  };

  // Handle completion screens
  const handleWorkoutComplete = () => {
    console.log("Saving workout data...", {
      currentStatus: workoutStatus,
      exerciseCount: Object.keys(exercises).length,
      elapsedTime: elapsedTime
    });
    
    handleFinishWorkout()
      .then((result) => {
        console.log("Workout saved with result:", result);
        
        // Add a small delay to show success message before redirecting
        setTimeout(() => {
          console.log("Workout completely finished, resetting session and navigating home");
          resetSession();
          setShowCompletion(false);
          setCompletionInitiated(false);
          
          // Navigate to home page after successful completion
          navigate('/');
        }, 300);
      })
      .catch((error) => {
        console.error("Error saving workout:", error);
        toast.error("Error saving workout. Attempting to navigate to home anyway.");
        
        // Even on error, navigate back to home page to prevent user getting stuck
        setTimeout(() => {
          resetSession(); // Force reset on error
          navigate('/');
        }, 1000);
      });
  };

  // Quick handler to open add exercise sheet from anywhere
  const handleOpenAddExercise = () => {
    console.log("TrainingSessionPage: Opening add exercise sheet");
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

  // We'll pass the handleOpenAddExercise directly to TrainingSessionContent
  // and remove the duplicate FloatingAddExerciseButton from here
  return (
    <TrainingSessionContent 
      onFinishWorkoutClick={handleFinishWorkoutClick}
      isSaving={isSaving}
      onOpenAddExercise={handleOpenAddExercise}
    />
  );
};

export default TrainingSessionPage;
