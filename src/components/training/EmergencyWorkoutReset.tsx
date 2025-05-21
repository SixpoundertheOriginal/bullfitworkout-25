
import React, { useState } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { useWorkoutStore } from '@/store/workout';
import { resetSession } from '@/store/workout/actions';

/**
 * Emergency component to help developers recover from zombie workout states
 * Only visible in development mode
 */
export const EmergencyWorkoutReset: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const { exercises, workoutStatus, isActive } = useWorkoutStore();
  
  const exerciseCount = Object.keys(exercises).length;
  const hasPotentialIssue = isActive && exerciseCount === 0;
  const hasNoSets = Object.values(exercises).some(sets => 
    !Array.isArray(sets) || sets.length === 0
  );

  // Determine if there's a possible zombie state
  const hasPossibleZombieState = 
    (isActive && exerciseCount === 0) || 
    (workoutStatus === 'active' && exerciseCount === 0) ||
    hasNoSets;

  const handleEmergencyReset = () => {
    if (window.confirm('⚠️ EMERGENCY RESET: This will completely reset your workout. Continue?')) {
      console.log('Emergency workout reset triggered');
      resetSession();
      toast.success('Workout completely reset', {
        description: 'All workout data has been cleared. Start a new workout.',
      });
    }
  };

  const handleForceValidate = () => {
    const { validateWorkoutState } = require('@/store/workout/actions');
    const isValid = validateWorkoutState();
    
    toast({
      title: isValid ? 'Workout validated' : 'Validation failed',
      description: `Validation result: ${isValid ? 'OK' : 'Issues detected and fixed'}`,
      variant: isValid ? 'default' : 'destructive',
    });
  };

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="mt-4">
      <Button 
        variant={hasPossibleZombieState ? "destructive" : "outline"} 
        size="sm"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between border border-gray-600 bg-gray-800/80 text-xs"
      >
        <div className="flex items-center">
          <AlertTriangle size={14} className={hasPossibleZombieState ? "text-red-500 mr-2" : "text-yellow-500 mr-2"} />
          Developer Controls
        </div>
        {hasPossibleZombieState && (
          <span className="bg-red-600/80 text-white text-xs px-2 py-0.5 rounded ml-2">
            Issues Detected
          </span>
        )}
      </Button>
      
      {expanded && (
        <div className="p-3 border border-gray-700 rounded-md bg-gray-800/60 mt-1 space-y-3">
          <div className="text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-400">Exercise Count:</div>
              <div>{exerciseCount}</div>
              <div className="text-gray-400">Workout Status:</div>
              <div>{workoutStatus}</div>
              <div className="text-gray-400">Active:</div>
              <div>{isActive ? 'Yes' : 'No'}</div>
              <div className="text-gray-400">Has Empty Sets:</div>
              <div>{hasNoSets ? '⚠️ Yes' : 'No'}</div>
            </div>
          </div>

          {hasPossibleZombieState && (
            <Alert variant="destructive" className="py-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-xs font-semibold">Zombie State Detected</AlertTitle>
              <AlertDescription className="text-xs">
                Your workout appears to be in an inconsistent state. Try validation 
                first, or use emergency reset as a last resort.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleForceValidate}
              className="text-xs"
            >
              Force Validate
            </Button>
            
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleEmergencyReset}
              className="text-xs flex items-center gap-1"
            >
              <RotateCcw size={12} />
              Emergency Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
