
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useWorkoutDetails } from '@/hooks/useWorkoutDetails';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Clock, Dumbbell, BarChart, Loader2, AlertCircle } from 'lucide-react';
import { useWeightUnit } from '@/context/WeightUnitContext';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function WorkoutCompletePage() {
  // Update to use workoutId consistently with route parameters
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { weightUnit } = useWeightUnit();
  
  const [totalSets, setTotalSets] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  
  // Get workout data either from URL param or state
  const stateWorkoutData = location.state?.workoutData;
  
  // Prefer workoutId from URL, but fallback to the one in state if available
  const effectiveWorkoutId = workoutId || stateWorkoutData?.id;
  
  const {
    workoutDetails,
    exerciseSets,
    loading,
    error
  } = useWorkoutDetails(effectiveWorkoutId);
  
  // Use state data if available and no workout details from the hook
  const effectiveWorkoutDetails = workoutDetails || stateWorkoutData;
  
  // Use either the exercise sets from the hook or from state
  const effectiveExerciseSets = exerciseSets || 
    (stateWorkoutData ? Object.fromEntries(
      Object.entries(stateWorkoutData.exercises || {}).map(([name, sets]) => [
        name, 
        Array.isArray(sets) ? sets : []
      ])
    ) : {});
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading workout details",
        description: "Please try again or check your connection",
        variant: "destructive"
      });
      
      // Only navigate away if we don't have state data to fall back on
      if (!stateWorkoutData) {
        navigate('/');
      }
    }
  }, [error, navigate, stateWorkoutData]);
  
  useEffect(() => {
    if (exerciseSets || stateWorkoutData?.exercises) {
      // Calculate total sets and volume
      let sets = 0;
      let volume = 0;
      
      const setsToProcess = exerciseSets || stateWorkoutData?.exercises || {};
      
      Object.values(setsToProcess).forEach(exerciseSets => {
        if (Array.isArray(exerciseSets)) {
          exerciseSets.forEach(set => {
            sets++;
            if (set.completed) {
              volume += set.weight * set.reps;
            }
          });
        }
      });
      
      setTotalSets(sets);
      setTotalVolume(volume);
    }
  }, [exerciseSets, stateWorkoutData]);
  
  if (loading && !stateWorkoutData) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-purple-500" />
        <p>Loading workout details...</p>
      </div>
    );
  }
  
  if (!effectiveWorkoutDetails) {
    return (
      <div className="p-8 text-center">
        <Alert variant="destructive" className="mb-6 max-w-md mx-auto bg-red-950/30 border-red-900">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Workout Not Found</AlertTitle>
          <AlertDescription>
            The workout you're looking for couldn't be found. (ID: {effectiveWorkoutId || 'not provided'})
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
      </div>
    );
  }
  
  const duration = effectiveWorkoutDetails.duration || 0;
  const trainingType = effectiveWorkoutDetails.training_type || 
                       effectiveWorkoutDetails.trainingType || 
                       'Workout';
  
  const exerciseCount = Object.keys(effectiveExerciseSets).length;
  
  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-800/30 border-2 border-green-500 mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Workout Complete!</h1>
        <p className="text-gray-400">
          Great job completing your {trainingType} workout
        </p>
      </div>
      
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{effectiveWorkoutDetails.name}</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-sm text-gray-400">Duration</div>
                <div className="font-semibold">{Math.round(duration / 60)} min</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-sm text-gray-400">Exercises</div>
                <div className="font-semibold">{exerciseCount}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-sm text-gray-400">Sets</div>
                <div className="font-semibold">{totalSets}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-sm text-gray-400">Volume</div>
                <div className="font-semibold">{totalVolume} {weightUnit}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          className="flex-1 border-gray-700" 
          onClick={() => navigate(`/workout-details/${effectiveWorkoutId || ''}`)}
          disabled={!effectiveWorkoutId}
        >
          View Details
        </Button>
        
        <Button 
          className="flex-1 bg-purple-700 hover:bg-purple-600"
          onClick={() => navigate('/')}
        >
          Done
        </Button>
      </div>
    </div>
  );
}

export default WorkoutCompletePage;
