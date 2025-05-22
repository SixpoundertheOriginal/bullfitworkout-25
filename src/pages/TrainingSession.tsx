
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';
import { useExercises } from "@/hooks/useExercises";
import { TrainingSessionLoading } from "@/components/training/TrainingSessionLoading";
import { SimplifiedTrainingContent } from "@/components/training/SimplifiedTrainingContent";
import { validateWorkoutState } from '@/store/workout/actions';
import { toast } from '@/hooks/use-toast';

const TrainingSessionPage = () => {
  const { isLoading: loadingExercises } = useExercises();
  const navigate = useNavigate();
  
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
        navigate('/');
      }
    }, 800);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  if (loadingExercises) {
    return <TrainingSessionLoading />;
  }

  // Render the simplified training content component
  return <SimplifiedTrainingContent />;
};

export default TrainingSessionPage;
