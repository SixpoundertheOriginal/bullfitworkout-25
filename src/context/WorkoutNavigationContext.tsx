import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutState } from '@/hooks/useWorkoutState';
import { toast } from '@/hooks/use-toast';

interface WorkoutNavigationContextType {
  confirmNavigation: (path: string) => void;
}

const WorkoutNavigationContext = createContext<WorkoutNavigationContextType | undefined>(undefined);

export const useWorkoutNavigation = () => {
  const context = useContext(WorkoutNavigationContext);
  if (!context) {
    throw new Error('useWorkoutNavigation must be used within a WorkoutNavigationProvider');
  }
  return context;
};

export const WorkoutNavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { isActive } = useWorkoutState();
  
  const confirmNavigation = (path: string) => {
    // If we're already on this path, do nothing
    if (window.location.pathname === path) return;
    
    // If there's an active workout, show a confirmation toast
    if (isActive && path !== '/training-session') {
      navigate(path);
      toast({
        title: "Navigation complete",
        description: "Your workout is still in progress. You can return via the banner."
      });
    } else {
      // Otherwise just navigate
      navigate(path);
    }
  };
  
  return (
    <WorkoutNavigationContext.Provider value={{ confirmNavigation }}>
      {children}
    </WorkoutNavigationContext.Provider>
  );
};
