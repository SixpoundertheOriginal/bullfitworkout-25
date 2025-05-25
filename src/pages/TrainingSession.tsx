
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';
import { useExercises } from "@/hooks/useExercises";
import { TrainingSessionLoading } from "@/components/training/TrainingSessionLoading";
import { SimplifiedTrainingContent } from "@/components/training/SimplifiedTrainingContent";
import { validateWorkoutState } from '@/store/workout/validators';
import { toast } from '@/hooks/use-toast';
import { useWorkoutStore } from '@/store/workout';

const TrainingSessionPage = () => {
  const { isLoading: loadingExercises } = useExercises();
  const navigate = useNavigate();
  const workoutStore = useWorkoutStore();
  const { workoutStatus, isActive, resetSession } = workoutStore;
  
  // Initialize the workout timer
  useWorkoutTimer();
  
  // Track workout termination status
  const isTerminatedStatus = workoutStatus === 'saved' || workoutStatus === 'idle';
  
  // Validate workout state when page loads
  useEffect(() => {
    console.log("TrainingSessionPage: Running comprehensive state validation");
    
    // Validate with slight delay to ensure store is hydrated
    const timer = setTimeout(() => {
      const state = workoutStore;
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
  }, [navigate, isActive, isTerminatedStatus, workoutStore, resetSession]);

  if (loadingExercises) {
    return <TrainingSessionLoading />;
  }

  // Render the simplified training content component
  return <SimplifiedTrainingContent />;
};

export default TrainingSessionPage;
