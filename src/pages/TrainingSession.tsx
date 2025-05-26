
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';
import { useExercises } from "@/hooks/useExercises";
import { TrainingSessionLoading } from "@/components/training/TrainingSessionLoading";
import { SimplifiedTrainingContent } from "@/components/training/SimplifiedTrainingContent";
import { useWorkoutStore } from '@/store/workout';

const TrainingSessionPage = () => {
  const { isLoading: loadingExercises } = useExercises();
  const navigate = useNavigate();
  const { isActive, workoutStatus } = useWorkoutStore();
  
  // Initialize the workout timer
  useWorkoutTimer();
  
  // Simple check: if workout is not active or is completed/saved, redirect to setup
  const shouldRedirect = !isActive || workoutStatus === 'saved' || workoutStatus === 'idle';
  
  if (shouldRedirect) {
    // Simple redirect without complex validation
    setTimeout(() => {
      navigate('/setup-workout', { 
        state: { from: 'training-session' }
      });
    }, 100);
    
    return <TrainingSessionLoading />;
  }

  if (loadingExercises) {
    return <TrainingSessionLoading />;
  }

  // Render the simplified training content component
  return <SimplifiedTrainingContent />;
};

export default TrainingSessionPage;
