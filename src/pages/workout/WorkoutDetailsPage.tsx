
import React, { useState } from 'react';
import { useWorkoutDetails } from '@/hooks/useWorkoutDetails';
import { WorkoutDetailsEnhanced } from '@/components/workouts/WorkoutDetailsEnhanced';
import { WorkoutDetailsLoading } from '@/components/workouts/WorkoutDetailsLoading';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkoutDetailsHeader } from '@/components/workouts/WorkoutDetailsHeader';
import { toast } from '@/hooks/use-toast';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { deleteWorkout } from '@/services/workoutService';
import { ExerciseSet } from '@/types/exercise';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function WorkoutDetailsPage() {
  // Update to use workoutId from params
  const { workoutId } = useParams<{ workoutId: string }>();
  const { 
    workoutDetails, 
    exerciseSets, 
    loading, 
    error, 
    updateExerciseSet 
  } = useWorkoutDetails(workoutId || '');
  
  const navigate = useNavigate();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  const handleEditClick = () => {
    // Navigate to edit page or open edit modal
    toast({
      title: "Edit functionality",
      description: "Edit functionality will be implemented soon."
    });
  };
  
  const handleDeleteClick = async () => {
    setIsDeleteConfirmOpen(true);
    // This would typically open a confirmation dialog
    const confirmed = window.confirm("Are you sure you want to delete this workout?");
    
    if (confirmed && workoutId) {
      try {
        await deleteWorkout(workoutId);
        toast({
          title: "Success",
          description: "Workout deleted successfully"
        });
        navigate('/workouts');
      } catch (err) {
        console.error("Error deleting workout:", err);
        toast({
          title: "Error",
          description: "Failed to delete workout",
          variant: "destructive"
        });
      } finally {
        setIsDeleteConfirmOpen(false);
      }
    } else {
      setIsDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return <WorkoutDetailsLoading />;
  }

  // Enhanced error state to provide more information
  if (error || !workoutDetails) {
    return (
      <div className="pt-16 h-full flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <Alert variant="destructive" className="mb-6 bg-red-950/30 border-red-900">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Workout Not Found</AlertTitle>
            <AlertDescription className="text-sm">
              {error ? 
                `Error: ${error}` : 
                `The workout could not be loaded or does not exist. ID: ${workoutId || 'not provided'}`
              }
            </AlertDescription>
          </Alert>
          <button 
            onClick={() => navigate('/workouts')}
            className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-md"
          >
            Return to Workouts
          </button>
        </div>
      </div>
    );
  }

  // Fixed the parameter type to match what WorkoutDetailsEnhanced expects
  const handleEditExercise = (exerciseName: string, sets: Record<string, ExerciseSet[]>) => {
    // This function will be implemented to handle editing exercises
    toast({
      title: "Edit exercise",
      description: `Edit functionality for ${exerciseName} will be implemented soon.`
    });
  };

  return (
    <div className="container py-6 max-w-5xl mx-auto">
      {workoutDetails && (
        <div className="space-y-6">
          <WorkoutDetailsHeader 
            workoutDetails={workoutDetails}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
          
          <WorkoutDetailsEnhanced 
            workout={workoutDetails}
            exercises={exerciseSets}
            onEditClick={handleEditClick}
            onEditExercise={handleEditExercise}
            className="mt-6"
          />
        </div>
      )}
    </div>
  );
}
