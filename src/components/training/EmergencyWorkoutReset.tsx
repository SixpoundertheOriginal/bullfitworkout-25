
import React, { useState } from 'react';
import { AlertTriangle, RotateCcw, Trash2, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { useWorkoutStore } from '@/store/workout';
import { useNavigate } from 'react-router-dom';

/**
 * Emergency component to help developers recover from zombie workout states
 * Only visible in development mode
 */
export const EmergencyWorkoutReset: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  
  // Get all the store state and actions
  const { 
    exercises, 
    workoutStatus, 
    isActive, 
    workoutId,
    resetSession,
    runWorkoutValidation
  } = useWorkoutStore();
  
  const exerciseCount = Object.keys(exercises).length;
  const hasPotentialIssue = isActive && exerciseCount === 0;
  const hasNoSets = Object.values(exercises).some(sets => 
    !Array.isArray(sets) || sets.length === 0
  );
  const noWorkoutId = isActive && !workoutId;

  // Determine if there's a possible zombie state
  const hasPossibleZombieState = 
    (isActive && exerciseCount === 0) || 
    (workoutStatus === 'active' && exerciseCount === 0) ||
    hasNoSets ||
    noWorkoutId;

  const handleEmergencyReset = () => {
    if (window.confirm('⚠️ EMERGENCY RESET: This will completely reset your workout. Continue?')) {
      console.log('Emergency workout reset triggered');
      resetSession();
      toast({
        title: 'Workout completely reset',
        description: 'All workout data has been cleared. Start a new workout.',
      });
    }
  };

  const handleForceFullReset = () => {
    if (window.confirm('⚠️ FORCE FULL RESET: This will purge ALL local storage and reload the page. Continue?')) {
      console.log('Force full reset triggered - clearing localStorage and reloading');
      localStorage.removeItem("workout-storage");
      toast({
        title: 'Local storage cleared',
        description: 'Reloading page to start fresh.',
      });
      // Give toast time to display before reload
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleForceValidate = () => {
    runWorkoutValidation();
    
    toast({
      title: 'Validation completed',
      description: 'Workout validation has been executed',
    });
  };
  
  const handleFixStuckWorkout = () => {
    if (window.confirm('⚠️ FIX STUCK WORKOUT: This will attempt to fix a stuck workout completion. Continue?')) {
      console.log('Fix stuck workout triggered');
      
      // First reset the session
      resetSession();
      
      // Then navigate to home page
      navigate('/');
      
      toast({
        title: 'Stuck workout fix attempted',
        description: 'Session reset and redirected to home page.',
      });
    }
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
              <div className="text-gray-400">Workout ID:</div>
              <div>{workoutId ? workoutId : '⚠️ Missing'}</div>
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

          <div className="flex flex-wrap gap-2">
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
              onClick={handleFixStuckWorkout}
              className="text-xs flex items-center gap-1"
            >
              <RefreshCw size={12} />
              Fix Stuck Completion
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
            
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleForceFullReset}
              className="text-xs flex items-center gap-1 bg-red-800 hover:bg-red-900"
            >
              <Trash2 size={12} />
              Force Full Reset (Dev)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
