
import { useEffect, useCallback, useRef } from 'react';
import { useTrainingSetupPersistence } from '@/hooks/useTrainingSetupPersistence';
import { LoadTrainingConfigFn } from '@/types/workout';
import { useWorkoutStore } from '@/store/workout';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

/**
 * Enhanced hook for handling initialization logic for training sessions
 * with comprehensive zombie state detection and cleanup
 */
export const useTrainingSessionInit = (isActive: boolean, hasExercises: boolean, startWorkout: () => void) => {
  const navigate = useNavigate();
  const { storedConfig, saveConfig } = useTrainingSetupPersistence();
  const cleanupPerformedRef = useRef(false);
  
  // Get workout store actions
  const { runWorkoutValidation, detectAndCleanupZombieWorkout, resetSession } = useWorkoutStore();
  
  // Load training config function
  const loadTrainingConfig: LoadTrainingConfigFn = useCallback(() => {
    return storedConfig;
  }, [storedConfig]);
  
  // Save training preferences to local storage
  const saveTrainingPreferences = useCallback((config: any) => {
    return saveConfig(config);
  }, [saveConfig]);
  
  // Enhanced zombie detection and cleanup
  const performZombieCleanup = useCallback(() => {
    console.log('🔍 Performing comprehensive zombie workout cleanup');
    
    try {
      // Run the store's zombie detection
      const zombieDetected = detectAndCleanupZombieWorkout();
      
      if (zombieDetected) {
        console.log('🧹 Zombie workout detected and cleaned up');
        
        // Navigate to setup if we're not already there
        if (window.location.pathname !== '/setup-workout') {
          navigate('/setup-workout', { 
            state: { errorReason: 'zombieWorkoutDetected' }
          });
        }
        
        return true;
      }
      
      // Also check for localStorage inconsistencies
      try {
        const storedData = localStorage.getItem('workout-storage');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          const state = parsed?.state;
          
          if (state?.isActive && (!state?.exercises || Object.keys(state.exercises).length === 0)) {
            console.warn('🧟‍♂️ Found zombie state in localStorage - cleaning up');
            localStorage.removeItem('workout-storage');
            resetSession();
            
            toast({
              title: "Workout Reset",
              description: "Detected and cleared invalid workout data from storage",
              variant: "destructive"
            });
            
            return true;
          }
        }
      } catch (storageError) {
        console.error('Error checking localStorage for zombie state:', storageError);
        // Clear potentially corrupted storage
        localStorage.removeItem('workout-storage');
      }
      
      console.log('✅ No zombie workouts detected');
      return false;
      
    } catch (error) {
      console.error('Error during zombie cleanup:', error);
      // Fall back to reset if there's an error
      resetSession();
      return true;
    }
  }, [detectAndCleanupZombieWorkout, resetSession, navigate]);
  
  // Initialize workout if coming from setup flow
  useEffect(() => {
    if (!isActive && hasExercises) {
      console.log('🚀 Starting new workout from existing exercises');
      startWorkout();
    } else if (!isActive && !hasExercises) {
      const config = loadTrainingConfig();
      if (config) {
        console.log('📋 Found saved training config:', config);
      } else {
        console.log('ℹ️ No saved config found and no active session');
      }
    }
  }, [isActive, hasExercises, startWorkout, loadTrainingConfig]);
  
  // Run comprehensive validation and cleanup on mount
  useEffect(() => {
    if (cleanupPerformedRef.current) return;
    
    console.log('🔧 Running initial workout validation and cleanup');
    
    // Perform zombie cleanup first
    const zombieFound = performZombieCleanup();
    
    if (!zombieFound) {
      // Run additional validation if no zombies found
      runWorkoutValidation();
    }
    
    cleanupPerformedRef.current = true;
  }, [performZombieCleanup, runWorkoutValidation]);
  
  // Validate and repair function for external use
  const validateAndRepair = useCallback(() => {
    console.log('🔍 Manual validation and repair requested');
    return performZombieCleanup();
  }, [performZombieCleanup]);
  
  return {
    loadTrainingConfig,
    saveTrainingPreferences,
    validateAndRepair,
    performZombieCleanup
  };
};
