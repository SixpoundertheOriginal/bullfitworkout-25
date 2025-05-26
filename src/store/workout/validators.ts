import { WorkoutExercises, WorkoutState, WorkoutError } from './types';
import { toast } from '@/hooks/use-toast';

/**
 * Comprehensive validation utilities for workout state
 * Centralizes all validation logic that was previously scattered across multiple files
 */

// Check if workout has any exercises
export const hasExercises = (exercises: WorkoutExercises): boolean => {
  return Object.keys(exercises).length > 0;
};

// Check if exercises have valid structure
export const hasValidExerciseStructure = (exercises: WorkoutExercises): boolean => {
  let valid = true;
  let exerciseCount = 0;
  let invalidExercises: string[] = [];

  Object.keys(exercises).forEach(exerciseName => {
    exerciseCount++;
    const sets = exercises[exerciseName];
    
    // Check if sets is properly defined
    if (!sets || !Array.isArray(sets) || sets.length === 0) {
      valid = false;
      invalidExercises.push(exerciseName);
      console.warn(`Invalid sets for exercise "${exerciseName}": sets is ${sets ? (Array.isArray(sets) ? 'empty array' : typeof sets) : 'undefined'}`);
      return;
    }
    
    // Check each set for required properties
    const hasInvalidSets = sets.some(set => {
      const isValid = (
        set && 
        typeof set === 'object' && 
        typeof set.weight === 'number' && 
        typeof set.reps === 'number' && 
        typeof set.restTime === 'number' &&
        typeof set.completed !== 'undefined'
      );
      
      if (!isValid) {
        console.warn(`Invalid set found in exercise "${exerciseName}":`, set);
      }
      
      return !isValid;
    });
    
    if (hasInvalidSets) {
      valid = false;
      invalidExercises.push(exerciseName);
    }
  });

  if (!valid) {
    console.warn(`Workout validation failed: found ${invalidExercises.length} invalid exercises out of ${exerciseCount} total`);
  }
  
  return valid;
};

// Check if workout was recently created (within grace period)
export const isRecentlyCreatedWorkout = (state: Partial<WorkoutState>, gracePeriodMs: number = 30000): boolean => {
  if (!state.startTime) return false;
  
  const startTime = typeof state.startTime === 'string' ? new Date(state.startTime).getTime() : state.startTime;
  const now = Date.now();
  const timeSinceCreation = now - startTime;
  
  return timeSinceCreation <= gracePeriodMs;
};

// Check if workout state is consistent
export const isWorkoutStateConsistent = (state: Partial<WorkoutState>): boolean => {
  // NEW: Allow active workouts with no exercises if they were recently created
  if (state.isActive && (!state.exercises || Object.keys(state.exercises || {}).length === 0)) {
    const isRecent = isRecentlyCreatedWorkout(state);
    if (isRecent) {
      console.log('✅ Active workout with 0 exercises is allowed - recently created');
      return true;
    } else {
      console.warn('❌ Inconsistent workout state: workout is active but has no exercises and is not recent');
      return false;
    }
  }
  
  // ... keep existing code (other consistency checks) the same ...
  if (state.activeExercise && state.exercises && !state.exercises[state.activeExercise]) {
    console.warn(`Inconsistent workout state: active exercise "${state.activeExercise}" does not exist in workout`);
    return false;
  }
  
  if (state.focusedExercise && state.exercises && !state.exercises[state.focusedExercise]) {
    console.warn(`Inconsistent workout state: focused exercise "${state.focusedExercise}" does not exist in workout`);
    return false;
  }
  
  if (state.isActive && !state.workoutId) {
    console.warn('Inconsistent workout state: active workout but no workoutId');
    return false;
  }
  
  return true;
};

// Validate if workout can be saved
export const canWorkoutBeSaved = (state: Partial<WorkoutState>): boolean => {
  // Cannot save a workout that has no exercises
  if (!state.exercises || Object.keys(state.exercises).length === 0) {
    return false;
  }
  
  // Cannot save a workout that hasn't started
  if (!state.startTime) {
    return false;
  }
  
  // Cannot save a workout that is already saved
  if (state.workoutStatus === 'saved') {
    return false;
  }

  // Cannot save a workout that is already in the process of saving
  if (state.workoutStatus === 'saving') {
    return false;
  }
  
  return true;
};

// Validate if a workout is "zombie" - in an inconsistent state that needs to be reset
export const isZombieWorkout = (state: Partial<WorkoutState>): boolean => {
  // UPDATED: Don't consider recently created workouts as zombies
  if (state.isActive && (!state.exercises || Object.keys(state.exercises).length === 0)) {
    const isRecent = isRecentlyCreatedWorkout(state);
    if (!isRecent) {
      console.warn('Detected zombie workout: Active but contains no exercises and is not recent');
      return true;
    }
    // If recent, it's not a zombie - it's a fresh workout
    return false;
  }
  
  // ... keep existing code (other zombie checks) the same ...
  if (state.explicitlyEnded && state.isActive) {
    console.warn('Detected zombie workout: Explicitly ended but still marked as active');
    return true;
  }
  
  if (state.workoutStatus === 'saved' && state.isActive) {
    console.warn('Detected zombie workout: Saved but still marked as active');
    return true;
  }
  
  const inactiveThreshold = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const now = Date.now();
  const lastActivity = state.lastTabActivity || 0;
  
  if (state.isActive && (now - lastActivity > inactiveThreshold)) {
    console.warn(`Detected zombie workout: Last activity was ${Math.floor((now - lastActivity) / (60 * 60 * 1000))} hours ago`);
    return true;
  }
  
  return false;
};

// Main validation function that runs comprehensive checks
export const validateWorkoutState = (
  state: Partial<WorkoutState>, 
  options: { showToasts?: boolean; attemptRepair?: boolean } = {}
): { isValid: boolean; issues: string[]; needsRepair: boolean } => {
  const { showToasts = true, attemptRepair = false } = options;
  const issues: string[] = [];
  
  // Skip validation for explicitly saved workouts
  if (state.workoutStatus === 'saved' && !state.isActive) {
    return { isValid: true, issues: [], needsRepair: false };
  }

  console.log("Running comprehensive workout validation with options:", options);

  // Check for zombie workout state
  if (isZombieWorkout(state)) {
    issues.push("Zombie workout detected - workout is in an inconsistent state");
    
    if (showToasts) {
      toast({
        title: "Workout inconsistency detected",
        description: "Your workout was in an invalid state and has been reset",
        variant: "destructive"
      });
    }
    
    return { isValid: false, issues, needsRepair: true };
  }
  
  // Check exercise data structure (only if exercises exist)
  if (state.exercises && Object.keys(state.exercises).length > 0 && !hasValidExerciseStructure(state.exercises)) {
    issues.push("Invalid exercise data structure detected");
    
    // Only show the toast if we're not going to attempt repair
    if (showToasts && !attemptRepair) {
      toast({
        title: "Exercise data issue detected",
        description: "Some exercises had invalid data and may need to be fixed",
        variant: "destructive"
      });
    }
    
    return { isValid: false, issues, needsRepair: true };
  }
  
  // Check for state consistency
  if (!isWorkoutStateConsistent(state)) {
    issues.push("Workout state is inconsistent");
    return { isValid: false, issues, needsRepair: true };
  }
  
  // If we reached this point, the workout state is valid
  return { isValid: true, issues: [], needsRepair: false };
};

// Helper to safely repair any issues in exercises
export const repairExercises = (exercises: WorkoutExercises): WorkoutExercises => {
  const repairedExercises: WorkoutExercises = {};
  let repairCount = 0;
  
  Object.keys(exercises).forEach(exerciseName => {
    const sets = exercises[exerciseName];
    
    if (!sets || !Array.isArray(sets) || sets.length === 0) {
      repairCount++;
      console.warn(`Skipping completely invalid exercise "${exerciseName}"`);
      return;
    }
    
    const validSets = sets.filter(set => set && typeof set === 'object').map(set => {
      const repairedSet = {
        id: set.id || `temp-${exerciseName}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        exercise_name: exerciseName,
        weight: typeof set.weight === 'number' ? set.weight : 0,
        reps: typeof set.reps === 'number' && set.reps > 0 ? set.reps : 10,
        restTime: typeof set.restTime === 'number' && set.restTime > 0 ? set.restTime : 60,
        completed: !!set.completed,
        set_number: typeof set.set_number === 'number' ? set.set_number : 0,
        isEditing: !!set.isEditing,
        ...set
      };
      
      return repairedSet;
    });
    
    if (validSets.length > 0) {
      repairedExercises[exerciseName] = validSets;
    } else {
      repairCount++;
    }
  });
  
  if (repairCount > 0) {
    console.log(`Repaired ${repairCount} exercises during validation`);
  }
  
  return repairedExercises;
};
