
import React from 'react';
import { useWorkoutStore } from '@/store/workout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmergencyWorkoutReset } from './EmergencyWorkoutReset';

/**
 * This is a development-only component to help debug workout state issues
 */
export const SetsDebugger: React.FC = () => {
  const { exercises, setExercises } = useWorkoutStore();

  const exerciseNames = Object.keys(exercises);

  const printExerciseState = () => {
    console.log("Current exercises state:", JSON.stringify(exercises, null, 2));
  };

  const forcePersist = () => {
    // Force a state update to ensure values are persisted
    setExercises({ ...exercises });
    console.log("Forced state persistence");
  };

  // Only render in development environment
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="bg-gray-900/60 border-gray-800 mt-4 overflow-hidden">
      <CardHeader className="bg-gray-900/80 border-b border-gray-800 py-2">
        <CardTitle className="text-sm flex justify-between items-center">
          <span>Workout State Debugger</span>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={printExerciseState}>
              Print State
            </Button>
            <Button variant="outline" size="sm" onClick={forcePersist}>
              Force Persist
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="text-xs max-h-48 overflow-auto rounded bg-black/30 p-2">
          {exerciseNames.map(name => (
            <div key={name} className="mb-3">
              <div className="font-semibold text-purple-400">{name}</div>
              <div className="pl-2 space-y-1">
                {exercises[name].map((set, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2">
                    <div>Set {index + 1}</div>
                    <div>Weight: {set.weight}</div>
                    <div>Reps: {set.reps}</div>
                    <div>{set.completed ? '✅' : '⌛'}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {exerciseNames.length === 0 && (
            <div className="text-gray-500">No exercises in workout</div>
          )}
        </div>
        
        {/* Add the emergency reset component */}
        <EmergencyWorkoutReset />
      </CardContent>
    </Card>
  );
};
