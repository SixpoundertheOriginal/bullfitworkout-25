
// This file is maintained for backward compatibility
// The functionality has been refactored to src/hooks/training-session

import { useTrainingSession as useTrainingSessionNew } from './training-session';
import { useEffect } from 'react';

// Re-export the refactored hook to maintain the same API
export const useTrainingSession = () => {
  // Log that we're using the refactored hook
  useEffect(() => {
    console.log('Using refactored useTrainingSession hook');
  }, []);
  
  return useTrainingSessionNew();
};
