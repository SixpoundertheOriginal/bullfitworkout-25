
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';
import { useExercises } from "@/hooks/useExercises";
import { TrainingSessionLoading } from "@/components/training/TrainingSessionLoading";
import { SimplifiedTrainingContent } from "@/components/training/SimplifiedTrainingContent";
import { validateWorkoutState, isRecentlyCreatedWorkout } from '@/store/workout/validators';
import { toast } from '@/hooks/use-toast';
import { useWorkoutStore } from '@/store/workout';

const TrainingSessionPage = () => {
  const { isLoading: loadingExercises } = useExercises();
  const navigate = useNavigate();
  const workoutStore = useWorkoutStore();
  const { workoutStatus, isActive, exercises, resetSession } = workoutStore;
  
  // Initialize the workout timer
  useWorkoutTimer();
  
  // Track workout termination status
  const isTerminatedStatus = workoutStatus === 'saved' || workoutStatus === 'idle';
  const hasExercises = Object.keys(exercises || {}).length > 0;
  
  // Enhanced validation for newly created workouts
  useEffect(() => {
    console.log("TrainingSessionPage: Running enhanced state validation");
    
    // Validate with delay to ensure store is hydrated
    const timer = setTimeout(() => {
      const state = workoutStore;
      
      // Special handling for newly created workouts
      if (isActive && !hasExercises) {
        const isRecent = isRecentlyCreatedWorkout(state);
        
        if (isRecent) {
          console.log("✅ Active workout with 0 exercises - recently created, allowing to proceed");
          toast({
            title: "Workout Started",
            description: "Add your first exercise to begin tracking your progress",
          });
          return; // Allow the newly created workout to proceed
        } else {
          console.warn("❌ Active workout with 0 exercises - not recent, treating as zombie");
        }
      }
      
      // Run standard validation for other cases
      const { isValid, needsRepair } = validateWorkoutState(state, { 
        showToasts: false,
        attemptRepair: false
      });
      
      if (!isValid) {
        if (needsRepair) {
          console.warn("Training session has invalid workout state that needs repair");
          toast({
            title: "Workout session was reset",
            description: "The workout data was in an invalid state and has been reset",
            variant: "destructive"
          });
          resetSession();
        }
        
        // Redirect to setup-workout instead of home
        navigate('/setup-workout', { 
          state: { errorReason: 'invalidState' }
        });
      } else if (!isActive && isTerminatedStatus) {
        console.log("Training session: Workout is not active, redirecting to setup");
        toast({
          title: "No active workout",
          description: "Please set up a new workout to begin",
        });
        navigate('/setup-workout', { 
          state: { errorReason: 'noActiveWorkout' }
        });
      }
    }, 800);
    
    return () => clearTimeout(timer);
  }, [navigate, isActive, isTerminatedStatus, hasExercises, workoutStore, resetSession]);

  if (loadingExercises) {
    return <TrainingSessionLoading />;
  }

  // Render the simplified training content component
  return <SimplifiedTrainingContent />;
};

export default TrainingSessionPage;
