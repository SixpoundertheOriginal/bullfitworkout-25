
import React, { createContext, useContext, ReactNode } from 'react';
import { useWorkoutStore } from './store';
import { WorkoutState } from './types';

// Create a context for the workout store
const WorkoutContext = createContext<WorkoutState | null>(null);

// Provider component that wraps the application
export function WorkoutProvider({ children }: { children: ReactNode }) {
  // Get the store
  const workoutStore = useWorkoutStore();
  
  return (
    <WorkoutContext.Provider value={workoutStore}>
      {children}
    </WorkoutContext.Provider>
  );
}

// Hook for accessing the workout context
export function useWorkoutContext() {
  const context = useContext(WorkoutContext);
  if (context === null) {
    throw new Error('useWorkoutContext must be used within a WorkoutProvider');
  }
  return context;
}
