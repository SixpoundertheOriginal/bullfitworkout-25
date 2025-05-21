
import { useEffect, useCallback, useRef } from 'react';
import { useTrainingSetupPersistence } from '@/hooks/useTrainingSetupPersistence';
import { LoadTrainingConfigFn } from '@/types/workout';
import { useWorkoutStore } from '@/store/workout';
import { toast } from '@/hooks/use-toast';

/**
 * Hook for handling initialization logic for training sessions
 * with enhanced zombie state detection
 */
export const useTrainingSessionInit = (isActive: boolean, hasExercises: boolean, startWorkout: () => void) => {
  const { storedConfig, saveConfig } = useTrainingSetupPersistence();
  const cleanupPerformedRef = useRef(false);
  
  // Get workout store state at the top level of the hook
  const { exercises, sessionId, isActive: storeIsActive, resetSession } = useWorkoutStore();
  
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
  
  // Add defensive logic to detect and clean up zombie workouts
  useEffect(() => {
    // Only run this check once per component mount
    if (cleanupPerformedRef.current) return;
    
    // Use the workout state obtained from the hook at the top level
    let zombieDetected = false;
    
    console.log('🔍 Checking for zombie workout state on app boot:', {
      exerciseCount: Object.keys(exercises).length,
      isActive: storeIsActive,
      hasExercises
    });
    
    // Case 1: Check for empty exercise objects
    if (storeIsActive && Object.keys(exercises).length === 0) {
      console.warn('🧟‍♂️ Detected zombie workout: active but no exercises');
      zombieDetected = true;
    }
    
    // Case 2: Check for invalid exercise data structures
    Object.keys(exercises).forEach(key => {
      const sets = exercises[key];
      
      // Check if sets is undefined, null, or an empty array
      if (!sets || !Array.isArray(sets) || sets.length === 0) {
        console.warn(`🧟‍♂️ Detected zombie exercise "${key}" with empty sets array`);
        zombieDetected = true;
        return;
      }
      
      // Check for malformed sets (missing required properties)
      const malformedSets = sets.some(set => 
        !set || 
        typeof set !== 'object' || 
        typeof set.weight !== 'number' || 
        typeof set.reps !== 'number' || 
        typeof set.restTime !== 'number'
      );
      
      if (malformedSets) {
        console.warn(`🧟‍♂️ Detected zombie exercise "${key}" with malformed sets`, sets);
        zombieDetected = true;
      }
    });
    
    // If zombie state detected, clean it up
    if (zombieDetected) {
      console.warn("🧹 Clearing zombie workout from persistent storage");
      
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
      
      // If Supabase is integrated and we have a sessionId, invalidate remote record
      if (sessionId) {
        try {
          // Fix: Use dynamic import properly with explicit type annotations
          // to avoid TypeScript's excessive type instantiation depth
          void (async () => {
            try {
              const { supabase } = await import('@/integrations/supabase/client');
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
          })();
        } catch (error) {
          // Supabase might not be integrated, silently continue
          console.log("ℹ️ Supabase not available for remote cleanup", error);
        }
      }
    }
    
    // Mark cleanup as performed
    cleanupPerformedRef.current = true;
  }, [exercises, storeIsActive, hasExercises, sessionId, resetSession]);
  
  return {
    loadTrainingConfig,
    saveTrainingPreferences
  };
};
