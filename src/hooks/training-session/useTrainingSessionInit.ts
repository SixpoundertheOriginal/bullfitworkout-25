
import { useEffect, useCallback, useRef } from 'react';
import { useTrainingSetupPersistence } from '@/hooks/useTrainingSetupPersistence';
import { LoadTrainingConfigFn } from '@/types/workout';
import { useWorkoutStore } from '@/store/workout';
import { toast } from '@/hooks/use-toast';
import { validateWorkoutState, isZombieWorkout } from '@/store/workout/validators';
import { resetSession } from '@/store/workout/actions';

/**
 * Hook for handling initialization logic for training sessions
 * with enhanced zombie state detection
 */
export const useTrainingSessionInit = (isActive: boolean, hasExercises: boolean, startWorkout: () => void) => {
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
      }
    }
  }, [isActive, hasExercises, startWorkout, loadTrainingConfig]);
  
  // Add centralized validation logic to detect and clean up zombie workouts
  useEffect(() => {
    // Only run this check once per component mount
    if (cleanupPerformedRef.current) return;
    
    // Use the workout state obtained from the hook at the top level
    const state = workoutStore;
    
    console.log('🔍 Checking for workout state validity on app boot:', {
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
      
      // Check if we have a session ID for remote cleanup
      if (sessionId) {
        // Handle remote cleanup if needed
        try {
          // Resolve TypeScript's excessive type instantiation depth issue
          // by using a simpler approach with type assertions
          const invalidateRemoteWorkout = async () => {
            try {
              // Use type assertion to help TypeScript with the import
              const module = await import('@/integrations/supabase/client') as { supabase: any };
              const { supabase } = module;
              
              if (!supabase) return;
              
              const result = await supabase
                .from('workout_sessions')
                .update({ 
                  status: 'abandoned',
                  metadata: { 
                    zombie_detected: true, 
                    cleaned_at: new Date().toISOString() 
                  }
                })
                .eq('session_id', sessionId);
                
              if (result.error) {
                console.warn("⚠️ Failed to invalidate remote workout:", result.error);
              } else {
                console.log("🔄 Invalidated remote workout session:", sessionId);
              }
            } catch (err) {
              console.warn("⚠️ Error invalidating remote workout:", err);
            }
          };
          
          // Execute the function but don't await its result
          void invalidateRemoteWorkout();
        } catch (error) {
          // Supabase might not be integrated, silently continue
          console.log("ℹ️ Supabase not available for remote cleanup", error);
        }
      }
    }
    
    // Mark cleanup as performed
    cleanupPerformedRef.current = true;
  }, [exercises, storeIsActive, hasExercises, sessionId, resetSession, workoutStore]);
  
  return {
    loadTrainingConfig,
    saveTrainingPreferences
  };
};
