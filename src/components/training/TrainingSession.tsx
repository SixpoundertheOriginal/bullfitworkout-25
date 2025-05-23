
import React, { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrainingConfig } from '@/hooks/useTrainingSetupPersistence';
import { useWorkoutStore } from '@/store/workoutStore';
import { toast } from "@/hooks/use-toast";
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { validateWorkoutState } from '@/store/workout/validators';

interface TrainingSessionProps {
  trainingConfig: TrainingConfig | null;
  onComplete: () => void;
  onCancel: () => void;
}

export const TrainingSession: React.FC<TrainingSessionProps> = ({ 
  trainingConfig,
  onComplete,
  onCancel
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isVisible } = usePageVisibility();
  const { 
    resetSession, 
    setTrainingConfig, 
    startWorkout, 
    updateLastActiveRoute, 
    isActive, 
    exercises, 
    elapsedTime,
    sessionId,
    workoutStatus
  } = useWorkoutStore();
  
  // Debug logging for component state
  useEffect(() => {
    console.log('TrainingSession rendered with:', { 
      trainingConfig, 
      isActive, 
      exerciseCount: Object.keys(exercises || {}).length,
      elapsedTime,
      sessionId,
      workoutStatus,
      isVisible 
    });
  }, [trainingConfig, isActive, exercises, elapsedTime, sessionId, isVisible, workoutStatus]);
  
  // Validate session state on mount
  useEffect(() => {
    const validateSession = async () => {
      const state = { isActive, exercises, workoutStatus };
      const { isValid, needsRepair } = validateWorkoutState(state, { 
        showToasts: false,
        attemptRepair: false
      });
      
      if (!isValid || needsRepair) {
        console.warn('TrainingSession: Invalid workout state detected, redirecting to setup');
        toast({
          title: "Session validation failed",
          description: "Please set up your workout again",
          variant: "destructive"
        });
        
        // Reset session and redirect to setup
        resetSession();
        navigate('/setup-workout', { 
          state: { errorReason: 'invalidState' } 
        });
      }
    };
    
    validateSession();
  }, [isActive, exercises, workoutStatus, resetSession, navigate]);
  
  // Session initialization logic - using useCallback to prevent multiple executions
  const initializeSession = useCallback(() => {
    // Case 1: A new config is provided and no active session exists
    if (trainingConfig && !isActive) {
      console.log('Starting new workout session with config:', trainingConfig);
      
      // Reset any existing session first to ensure clean slate
      resetSession();
      
      // Set up the new training session
      setTrainingConfig(trainingConfig);
      
      // Start workout and update route - order matters here
      updateLastActiveRoute('/training-session');
      startWorkout();
      
      // Show toast to confirm workout started
      toast({
        title: "Workout started",
        description: "You can return to it anytime from the banner"
      });
    } 
    // Case 2: Active session exists - Just navigate to it
    else if (isActive) {
      console.log('Navigating to existing active workout session');
      
      // Update route to ensure consistency
      updateLastActiveRoute('/training-session');
      
      // Only show toast if we have exercises (not just a new session)
      if (exercises && Object.keys(exercises).length > 0) {
        toast({
          title: "Resuming your active workout"
        });
      }
    }
    // Case 3: No config, no active session - Redirect to setup
    else if (!trainingConfig && !isActive) {
      console.log('No training config or active session, redirecting to setup');
      navigate('/setup-workout', { 
        state: { errorReason: 'missingConfig' } 
      });
    }
  }, [
    trainingConfig, 
    isActive, 
    resetSession, 
    setTrainingConfig, 
    startWorkout, 
    updateLastActiveRoute, 
    navigate, 
    exercises
  ]);

  // Run initialization once on mount
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-white">Loading training session...</p>
    </div>
  );
};
