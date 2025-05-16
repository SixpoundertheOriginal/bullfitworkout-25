
import React, { useEffect } from 'react';
import { useWorkoutStore } from './store';
import { getStore } from './store';
import { toast } from '@/hooks/use-toast';

// Hook for using workout timer functionality
export const useWorkoutTimer = () => {
  const { isActive, setElapsedTime } = useWorkoutStore();

  // Timer effect to update elapsed time
  useEffect(() => {
    if (isActive) {
      const timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isActive, setElapsedTime]);

  return { isActive };
};

// Hook for handling page visibility changes
export const useWorkoutPageVisibility = () => {
  const { isActive, setElapsedTime, startTime } = useWorkoutStore();
  
  React.useEffect(() => {
    if (!document || !isActive) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        // When tab becomes visible again, update elapsed time
        if (startTime) {
          const storedStartTime = new Date(startTime);
          const currentTime = new Date();
          const calculatedElapsedTime = Math.floor(
            (currentTime.getTime() - storedStartTime.getTime()) / 1000
          );
          
          setElapsedTime(calculatedElapsedTime);
          console.log(`Updated elapsed time after tab switch: ${calculatedElapsedTime}s`);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, setElapsedTime, startTime]);
};

// Hook for adding exercises to workout
export const useAddExercise = () => {
  const { 
    setExercises, 
    setActiveExercise, 
    setFocusedExercise, 
    workoutStatus, 
    startWorkout 
  } = useWorkoutStore();

  const addExercise = (exercise: string | { name: string }) => {
    const name = typeof exercise === 'string' ? exercise : exercise.name;
    
    // Check if exercise already exists
    // Use getStore() instead of useWorkoutStore.getState()
    const exercises = getStore().getState().exercises;
    if (exercises[name]) {
      toast({ 
        title: "Exercise already added", 
        description: `${name} is already in your workout` 
      });
      return false;
    }
    
    // Add exercise with default set
    setExercises(prev => ({
      ...prev, 
      [name]: [{ 
        weight: 0, 
        reps: 0, 
        restTime: 60, 
        completed: false, 
        isEditing: false 
      }]
    }));
    
    // Update active and focused exercise
    setActiveExercise(name);
    setFocusedExercise(name);
    
    // Start workout if not already started
    if (workoutStatus === 'idle') {
      startWorkout();
    }
    
    return true;
  };
  
  return { addExercise };
};

// Export index file to simplify imports
export { useWorkoutStore } from './store';
