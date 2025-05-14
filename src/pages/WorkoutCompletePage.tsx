
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkoutDetails } from '@/hooks/useWorkoutDetails';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Clock, Dumbbell, BarChart } from 'lucide-react';

export function WorkoutCompletePage() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const [totalSets, setTotalSets] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  
  const {
    workoutDetails,
    exerciseSets,
    loading,
    error
  } = useWorkoutDetails(workoutId);
  
  useEffect(() => {
    if (error) {
      navigate('/');
    }
  }, [error, navigate]);
  
  useEffect(() => {
    if (exerciseSets) {
      // Calculate total sets and volume
      let sets = 0;
      let volume = 0;
      
      Object.values(exerciseSets).forEach(exerciseSets => {
        exerciseSets.forEach(set => {
          sets++;
          if (set.completed) {
            volume += set.weight * set.reps;
          }
        });
      });
      
      setTotalSets(sets);
      setTotalVolume(volume);
    }
  }, [exerciseSets]);
  
  if (loading) {
    return <div className="p-8 text-center">Loading workout details...</div>;
  }
  
  if (!workoutDetails) {
    return <div className="p-8 text-center">Workout not found</div>;
  }
  
  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-800/30 border-2 border-green-500 mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Workout Complete!</h1>
        <p className="text-gray-400">
          Great job completing your {workoutDetails.training_type} workout
        </p>
      </div>
      
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{workoutDetails.name}</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-sm text-gray-400">Duration</div>
                <div className="font-semibold">{workoutDetails.duration} min</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-sm text-gray-400">Exercises</div>
                <div className="font-semibold">{Object.keys(exerciseSets).length}</div>
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
                <div className="font-semibold">{totalVolume} kg</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          className="flex-1 border-gray-700" 
          onClick={() => navigate(`/workout/${workoutId}`)}
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
