
import { useEffect, useCallback } from 'react';
import { useTrainingSetupPersistence } from '@/hooks/useTrainingSetupPersistence';
import { LoadTrainingConfigFn } from '@/types/workout';

/**
 * Hook for handling initialization logic for training sessions
 */
export const useTrainingSessionInit = (isActive: boolean, hasExercises: boolean, startWorkout: () => void) => {
  const { storedConfig, saveConfig } = useTrainingSetupPersistence();
  
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
      }
    }
  }, [isActive, hasExercises, startWorkout, loadTrainingConfig]);
  
  return {
    loadTrainingConfig,
    saveTrainingPreferences
  };
};
