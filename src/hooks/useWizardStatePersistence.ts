import { useCallback, useRef, useEffect } from 'react';
import { useTrainingSetupPersistence } from './useTrainingSetupPersistence';

interface WizardState {
  step: number;
  trainingType: string;
  bodyFocus: string[];
  duration: number;
  timestamp: number;
  sessionId: string;
}

interface UseWizardStatePersistenceOptions {
  throttleMs?: number;
  maxAge?: number; // Maximum age in milliseconds
  enableThrottling?: boolean;
}

export function useWizardStatePersistence({
  throttleMs = 1000, // Save at most once per second
  maxAge = 3600000, // 1 hour
  enableThrottling = true
}: UseWizardStatePersistenceOptions = {}) {
  
  const { saveConfig, storedConfig, clearConfig } = useTrainingSetupPersistence();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<number>(0);
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  // Throttled save function to prevent excessive localStorage writes
  const saveWizardState = useCallback((state: Omit<WizardState, 'timestamp' | 'sessionId'>) => {
    const now = Date.now();
    
    const doSave = () => {
      const fullState: WizardState = {
        ...state,
        timestamp: now,
        sessionId: sessionIdRef.current
      };
      
      // Save using existing training setup persistence
      saveConfig({
        trainingType: state.trainingType,
        tags: [],
        duration: state.duration,
        bodyFocus: state.bodyFocus,
        lastUpdated: new Date(now).toISOString(),
        quickStart: false
      });
      
      // Also save to a separate wizard-specific key for immediate recovery
      try {
        localStorage.setItem('workout_wizard_progress', JSON.stringify(fullState));
        lastSaveRef.current = now;
      } catch (error) {
        console.error('Failed to save wizard state:', error);
      }
    };

    if (!enableThrottling) {
      doSave();
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // If enough time has passed, save immediately
    if (now - lastSaveRef.current >= throttleMs) {
      doSave();
    } else {
      // Otherwise, schedule a save
      saveTimeoutRef.current = setTimeout(doSave, throttleMs);
    }
  }, [saveConfig, enableThrottling, throttleMs]);

  // Restore wizard state with age validation
  const restoreWizardState = useCallback((): WizardState | null => {
    try {
      const savedProgress = localStorage.getItem('workout_wizard_progress');
      if (savedProgress) {
        const state: WizardState = JSON.parse(savedProgress);
        
        // Check if state is too old
        if (Date.now() - state.timestamp > maxAge) {
          console.log('Wizard state expired, clearing');
          localStorage.removeItem('workout_wizard_progress');
          return null;
        }
        
        return state;
      }
      
      // Fallback to stored config if available
      if (storedConfig) {
        return {
          step: 0,
          trainingType: storedConfig.trainingType || 'strength',
          bodyFocus: storedConfig.bodyFocus || [],
          duration: storedConfig.duration || 45,
          timestamp: new Date(storedConfig.lastUpdated || Date.now()).getTime(),
          sessionId: sessionIdRef.current
        };
      }
    } catch (error) {
      console.error('Failed to restore wizard state:', error);
      // Clear corrupted data
      localStorage.removeItem('workout_wizard_progress');
    }
    
    return null;
  }, [storedConfig, maxAge]);

  // Clear wizard state and clean up
  const clearWizardState = useCallback(() => {
    try {
      localStorage.removeItem('workout_wizard_progress');
      clearConfig();
    } catch (error) {
      console.error('Failed to clear wizard state:', error);
    }
  }, [clearConfig]);

  // Memory cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveWizardState,
    restoreWizardState,
    clearWizardState,
    hasStoredState: !!storedConfig
  };
}
