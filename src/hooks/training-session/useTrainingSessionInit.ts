
import { useEffect, useCallback, useRef } from 'react';
import { useWorkoutStore } from '@/store/workout';

/**
 * Simplified hook for handling initialization logic for training sessions
 * PHASE 1: Removed complex validation and state hooks to prevent React queue issues
 */
export const useTrainingSessionInit = (isActive: boolean, hasExercises: boolean, startWorkout: () => void) => {
  const initializedRef = useRef(false);
  
  // Get only what we need from the store to avoid hook dependency issues
  const setTrainingConfig = useWorkoutStore((state) => state.setTrainingConfig);
  
  // Simple load function that doesn't use hooks
  const loadTrainingConfig = useCallback(() => {
    try {
      const { data: { user } } = { data: { user: { id: 'temp' } } }; // Simplified for now
      if (!user) return null;
      
      const key = `training_setup_${user.id}`;
      const savedConfig = localStorage.getItem(key);
      return savedConfig ? JSON.parse(savedConfig) : null;
    } catch (error) {
      console.error("Error loading training configuration:", error);
      return null;
    }
  }, []);
  
  // Simple save function that doesn't use hooks
  const saveTrainingPreferences = useCallback((config: any) => {
    try {
      const { data: { user } } = { data: { user: { id: 'temp' } } }; // Simplified for now
      if (!user) return null;
      
      const key = `training_setup_${user.id}`;
      const configWithTimestamp = {
        ...config,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(key, JSON.stringify(configWithTimestamp));
      console.log('Saved training config to localStorage');
      return configWithTimestamp;
    } catch (error) {
      console.error("Error saving training configuration:", error);
      return null;
    }
  }, []);
  
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
  }, [isActive, hasExercises, startWorkout, loadTrainingConfig, setTrainingConfig]);
  
  return {
    loadTrainingConfig,
    saveTrainingPreferences
  };
};
