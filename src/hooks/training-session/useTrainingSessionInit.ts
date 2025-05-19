
import { useEffect, useCallback } from 'react';
import { useTrainingSetupPersistence } from '@/hooks/useTrainingSetupPersistence';
import { LoadTrainingConfigFn } from '@/types/workout';

/**
 * Hook for handling initialization logic for training sessions
 */
export const useTrainingSessionInit = (isActive: boolean, hasExercises: boolean, startWorkout: () => void) => {
  const { storedConfig, saveConfig } = useTrainingSetupPersistence();
  
  // ❗ Avoid argument drift - explicit type for no-arguments function
  // Implementation of LoadTrainingConfigFn = () => TrainingConfig | null
  const loadTrainingConfig: LoadTrainingConfigFn = useCallback(() => {
    // Simply return the stored config without any arguments
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
      // Try to load saved config - FIXED: Call with NO arguments
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
