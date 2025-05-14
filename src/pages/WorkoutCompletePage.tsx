
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkoutDetails } from '@/hooks/useWorkoutDetails';
import { WorkoutCompletion } from '@/components/training/WorkoutCompletion';
import { WorkoutSummaryCard } from '@/components/workouts/WorkoutSummaryCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { WorkoutSummary } from '@/components/workouts/WorkoutSummary';
import { toast } from '@/hooks/use-toast';
import { Home, Dumbbell, BarChart, ArrowLeft } from 'lucide-react';

export function WorkoutCompletePage() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const { workout, loading, error } = useWorkoutDetails(workoutId);
  
  if (loading) {
    return (
      <div className="container max-w-screen-md mx-auto py-6 px-4">
        <Skeleton className="h-12 w-3/4 mb-6" />
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </div>
    );
  }
  
  if (error || !workout) {
    // Show error toast and navigate to home
    toast({
      title: "Error loading workout",
      description: error || "Workout not found",
      variant: "destructive"
    });
    
    return (
      <div className="container max-w-screen-md mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Workout not found</h2>
        <p className="text-gray-500 mb-6">The requested workout could not be found.</p>
        <Button onClick={() => navigate('/')}>Return to Home</Button>
      </div>
    );
  }
  
  // Check if the workout has actually been completed
  const isWorkoutCompleted = workout.end_time !== null;
  
  if (!isWorkoutCompleted) {
    return (
      <div className="container max-w-screen-md mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Workout Not Completed</h2>
        <p className="text-gray-500 mb-6">This workout has not been marked as complete yet.</p>
        <div className="space-y-4">
          <Button onClick={() => navigate(`/workout/${workoutId}`)} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" /> Return to Workout
          </Button>
          <Button onClick={() => navigate('/')} variant="outline" className="w-full">
            <Home className="h-4 w-4 mr-2" /> Return to Home
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-screen-md mx-auto py-6 px-4 pb-20">
      <WorkoutCompletion workout={workout} />
      
      <div className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold">Workout Summary</h2>
        
        <WorkoutSummaryCard workout={workout} />
        
        <Card className="border-gray-800 bg-gray-900/50">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart className="h-5 w-5 text-purple-500" /> Performance Stats
            </h3>
            
            <WorkoutSummary workout={workout} />
          </div>
        </Card>
        
        <div className="flex flex-col gap-4 pt-6">
          <Button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
          >
            <Home className="h-4 w-4 mr-2" /> Back to Home
          </Button>
          
          <Button 
            onClick={() => navigate('/workout/new')}
            variant="outline" 
            className="border-gray-700"
          >
            <Dumbbell className="h-4 w-4 mr-2" /> Start New Workout
          </Button>
        </div>
      </div>
    </div>
  );
}
