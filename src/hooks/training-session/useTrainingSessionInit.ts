
import { useEffect, useCallback, useRef } from 'react';
import { useTrainingSetupPersistence } from '@/hooks/useTrainingSetupPersistence';
import { LoadTrainingConfigFn } from '@/types/workout';
import { useWorkoutStore } from '@/store/workout';

/**
 * Simplified hook for handling initialization logic for training sessions
 * PHASE 1: Removed complex validation to stop infinite loops
 */
export const useTrainingSessionInit = (isActive: boolean, hasExercises: boolean, startWorkout: () => void) => {
  const { storedConfig, saveConfig } = useTrainingSetupPersistence();
  const initializedRef = useRef(false);
  
  // Get workout store actions
  const { setTrainingConfig } = useWorkoutStore();
  
  // Load training config function
  const loadTrainingConfig: LoadTrainingConfigFn = useCallback(() => {
    return storedConfig;
  }, [storedConfig]);
  
  // Save training preferences to local storage
  const saveTrainingPreferences = useCallback((config: any) => {
    console.log('💾 Saving training preferences:', config);
    return saveConfig(config);
  }, [saveConfig]);
  
  // Simple initialization - only runs once
  useEffect(() => {
    if (initializedRef.current) return;
    
    console.log('🚀 Training session initialization');
    
    if (!isActive && hasExercises) {
      console.log('Starting new workout from existing exercises');
      startWorkout();
    } else if (!isActive && !hasExercises) {
      const config = loadTrainingConfig();
      if (config) {
        console.log('📋 Found saved training config');
        setTrainingConfig(config);
      }
    }
    
    initializedRef.current = true;
  }, []); // Run only once on mount
  
  return {
    loadTrainingConfig,
    saveTrainingPreferences
  };
};
