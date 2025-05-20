import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Plus } from "lucide-react";
import { TrainingStartButton } from './TrainingStartButton';
import { useWorkoutStore } from '@/store/workout/store';
import { useExerciseSuggestions } from '@/hooks/useExerciseSuggestions';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface WorkoutStarterProps {
  trainingType?: string;
  onAddExerciseClick?: () => void;
}

export const WorkoutStarter: React.FC<WorkoutStarterProps> = ({ 
  trainingType = "strength",
  onAddExerciseClick 
}) => {
  const navigate = useNavigate();
  const { isActive, exercises, startWorkout, updateLastActiveRoute } = useWorkoutStore();
  const { suggestedExercises } = useExerciseSuggestions(trainingType);
  const hasExercises = Object.keys(exercises).length > 0;
  
  // Handle starting a new workout and immediately navigating to add exercises
  const handleStartAndAddExercises = () => {
    console.log('WorkoutStarter: handleStartAndAddExercises called');
    
    // If there's a custom handler provided, use that instead
    if (onAddExerciseClick) {
      console.log('WorkoutStarter: Using provided onAddExerciseClick handler');
      onAddExerciseClick();
      return;
    }
    
    // Otherwise, start a workout and navigate to the training session
    console.log('WorkoutStarter: Starting workout and navigating to training session');
    startWorkout();
    updateLastActiveRoute('/training-session');
    navigate('/training-session');
    
    // Show notification for adding exercises
    setTimeout(() => {
      toast({
        title: "Add your first exercise",
        description: "Click the + button to start tracking your workout"
      });
    }, 300);
  };
  
  // Don't show this component if a workout is active and has exercises
  if (isActive && hasExercises) {
    return null;
  }
  
  // Show different UI for active workout with no exercises yet
  if (isActive && !hasExercises) {
    return (
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-purple-400" />
            Workout Started
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-10">
          <p className="text-center text-gray-400 mb-8">
            Your workout has started! Add your first exercise to begin tracking your progress.
          </p>
          
          <Button
            onClick={onAddExerciseClick || (() => {})}
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Exercise
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Default view - show start button
  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-purple-400" />
          Ready to Train
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-10">
        <TrainingStartButton 
          label="Start Workout" 
          onStartClick={() => {
            console.log('WorkoutStarter: TrainingStartButton clicked');
            startWorkout();
            updateLastActiveRoute('/training-session');
            navigate('/training-session');
          }} 
        />
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 mb-2">
            Ready for your workout? Start tracking your progress and see your gains over time.
          </p>
          {suggestedExercises.length > 0 && (
            <p className="text-xs text-gray-500">
              We have {suggestedExercises.length} personalized exercise suggestions waiting for you.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
