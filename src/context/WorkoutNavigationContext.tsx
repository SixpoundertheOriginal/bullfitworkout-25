import React, { createContext, useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  // Make sure this component only renders when inside a Router
  try {
    const navigate = useNavigate();
    const location = useLocation(); // We'll use this to check the current path
    const { isActive } = useWorkoutState();
    
    const confirmNavigation = (path: string) => {
      // If we're already on this path, do nothing
      if (location.pathname === path) return;
      
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
  } catch (error) {
    // If we're not in a Router context, just render children directly
    console.warn("WorkoutNavigationProvider: Router context not available, navigation features disabled.");
    
    // Provide a fallback that does nothing
    const noopNavigate = (path: string) => {
      console.warn(`Navigation to ${path} attempted outside Router context`);
    };
    
    return (
      <WorkoutNavigationContext.Provider value={{ confirmNavigation: noopNavigate }}>
        {children}
      </WorkoutNavigationContext.Provider>
    );
  }
};
