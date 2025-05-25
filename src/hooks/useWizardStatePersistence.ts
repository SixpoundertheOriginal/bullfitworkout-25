
import { useCallback, useRef, useEffect, useMemo } from 'react';
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
  maxAge?: number;
  enableThrottling?: boolean;
}

export function useWizardStatePersistence({
  throttleMs = 2000, // Increased default throttling
  maxAge = 3600000,
  enableThrottling = true
}: UseWizardStatePersistenceOptions = {}) {
  
  const { saveConfig, storedConfig, clearConfig } = useTrainingSetupPersistence();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<number>(0);
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const isSavingRef = useRef<boolean>(false);
  const lastSavedStateRef = useRef<string>(''); // Track last saved state to prevent duplicate saves

  // Memoized save function with duplicate prevention
  const saveWizardState = useCallback((state: Omit<WizardState, 'timestamp' | 'sessionId'>) => {
    // Create state hash to prevent duplicate saves
    const stateHash = JSON.stringify(state);
    if (stateHash === lastSavedStateRef.current) {
      console.log('💾 Skipping duplicate save');
      return;
    }

    // Prevent concurrent saves
    if (isSavingRef.current) {
      console.log('💾 Save already in progress, skipping');
      return;
    }

    const now = Date.now();
    
    const doSave = () => {
      isSavingRef.current = true;
      
      try {
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
        localStorage.setItem('workout_wizard_progress', JSON.stringify(fullState));
        lastSaveRef.current = now;
        lastSavedStateRef.current = stateHash; // Update last saved state
        console.log('💾 Wizard state saved successfully');
      } catch (error) {
        console.error('❌ Failed to save wizard state:', error);
      } finally {
        isSavingRef.current = false;
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

  // Memoized restore function
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
      localStorage.removeItem('workout_wizard_progress');
    }
    
    return null;
  }, [storedConfig, maxAge]);

  // Memoized clear function
  const clearWizardState = useCallback(() => {
    try {
      // Clear any pending saves
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      
      isSavingRef.current = false;
      localStorage.removeItem('workout_wizard_progress');
      clearConfig();
      console.log('Wizard state cleared successfully');
    } catch (error) {
      console.error('Failed to clear wizard state:', error);
    }
  }, [clearConfig]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      isSavingRef.current = false;
    };
  }, []);

  // Memoize the return object to prevent re-renders
  return useMemo(() => ({
    saveWizardState,
    restoreWizardState,
    clearWizardState,
    hasStoredState: !!storedConfig
  }), [saveWizardState, restoreWizardState, clearWizardState, storedConfig]);
}
