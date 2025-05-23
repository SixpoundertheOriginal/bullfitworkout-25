
import { useEffect, useCallback, useRef } from 'react';
import { useTrainingSetupPersistence } from '@/hooks/useTrainingSetupPersistence';
import { LoadTrainingConfigFn } from '@/types/workout';
import { useWorkoutStore } from '@/store/workout';
import { toast } from '@/hooks/use-toast';
import { validateWorkoutState, isZombieWorkout } from '@/store/workout/validators';
import { resetSession } from '@/store/workout/actions';
import { useNavigate } from 'react-router-dom';

/**
 * Hook for handling initialization logic for training sessions
 * with enhanced zombie state detection and unified workflow
 */
export const useTrainingSessionInit = (isActive: boolean, hasExercises: boolean, startWorkout: () => void) => {
  const navigate = useNavigate();
  const { storedConfig, saveConfig } = useTrainingSetupPersistence();
  const cleanupPerformedRef = useRef(false);
  
  // Get workout store at the top level of the hook
  const workoutStore = useWorkoutStore();
  const { exercises, sessionId, isActive: storeIsActive, resetSession } = workoutStore;
  
  // Explicitly implement with the centralized type
  const loadTrainingConfig: LoadTrainingConfigFn = useCallback(() => {
    // Return the stored config with no arguments
    return storedConfig;
  }, [storedConfig]);
  
  // Save training preferences to local storage
  const saveTrainingPreferences = useCallback((config: any) => {
    return saveConfig(config);
  }, [saveConfig]);
  
  // Initialize workout if coming from a setup flow
  useEffect(() => {
    // Only start if not already active and has exercises
    if (!isActive && hasExercises) {
      console.log('Starting new workout from existing exercises');
      startWorkout();
    } else if (!isActive && !hasExercises) {
      // Call with NO arguments as per the type definition
      const config = loadTrainingConfig();
      
      if (config) {
        console.log('Found saved training config:', config);
      } else {
        console.log('No saved config found and no active session');
      }
    }
  }, [isActive, hasExercises, startWorkout, loadTrainingConfig]);
  
  // Validate workout state and redirect if necessary
  const validateAndRepair = useCallback(() => {
    // Use the workout state obtained from the hook at the top level
    const state = workoutStore;
    
    console.log('🔍 Checking for workout state validity:', {
      exerciseCount: Object.keys(exercises).length,
      isActive: storeIsActive,
      hasExercises
    });
    
    // Use our centralized validators
    const { isValid, needsRepair } = validateWorkoutState(state, { 
      showToasts: false, 
      attemptRepair: false
    });
    
    if (!isValid && needsRepair) {
      console.warn("🧟‍♂️ Detected problematic workout state that needs to be repaired");
      
      // Reset workout state completely
      resetSession();
      
      // Double-check by also manually removing from localStorage
      try {
        localStorage.removeItem("workout-storage");
        console.log("🗑️ Manually removed workout-storage from localStorage");
      } catch (e) {
        console.error("⚠️ Failed to clear localStorage:", e);
      }
      
      // Show toast notification to inform user
      toast({
        title: "Workout reset",
        description: "Detected and cleared invalid workout data",
        variant: "destructive"
      });
      
      // Redirect to setup page
      navigate('/setup-workout', { 
        state: { errorReason: 'zombieWorkoutDetected' }
      });
      
      return false;
    }
    
    return true;
  }, [exercises, storeIsActive, hasExercises, resetSession, workoutStore, navigate]);
  
  // Add centralized validation logic to detect and clean up zombie workouts
  useEffect(() => {
    // Only run this check once per component mount
    if (cleanupPerformedRef.current) return;
    
    validateAndRepair();
    
    // Mark cleanup as performed
    cleanupPerformedRef.current = true;
  }, [validateAndRepair]);
  
  return {
    loadTrainingConfig,
    saveTrainingPreferences,
    validateAndRepair
  };
};
