
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell, Plus } from 'lucide-react';

export interface EmptyWorkoutStateProps {
  onTemplateSelect?: (template: string) => void;
  onAddExerciseClick: () => void;
}

export function EmptyWorkoutState({ 
  onTemplateSelect, 
  onAddExerciseClick 
}: EmptyWorkoutStateProps) {
  
  // Common exercises people might want to add quickly
  const quickExercises = [
    'Bench Press',
    'Squat',
    'Deadlift',
    'Pull-up',
    'Push-up'
  ];
  
  return (
    <Card className="p-6 text-center border-dashed border-gray-700 bg-gray-900/50">
      <Dumbbell className="h-12 w-12 mx-auto mb-4 text-purple-500/50" />
      
      <h3 className="text-xl font-medium mb-2">Start Adding Exercises</h3>
      <p className="text-gray-400 mb-6">
        This workout doesn't have any exercises yet. Add your first exercise to get started.
      </p>
      
      <Button
        onClick={onAddExerciseClick}
        className="w-full mb-6 gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
      >
        <Plus size={18} /> Add Exercise
      </Button>
      
      {onTemplateSelect && (
        <>
          <div className="text-sm text-gray-400 mb-3">Or quickly add a common exercise:</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {quickExercises.map(exercise => (
              <Button
                key={exercise}
                variant="outline"
                size="sm"
                className="border-gray-700 bg-gray-800/50"
                onClick={() => onTemplateSelect(exercise)}
              >
                {exercise}
              </Button>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
