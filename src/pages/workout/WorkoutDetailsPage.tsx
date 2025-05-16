
import React, { useState } from 'react';
import { useWorkoutDetails } from '@/hooks/useWorkoutDetails';
import { WorkoutDetailsEnhanced } from '@/components/workouts/WorkoutDetailsEnhanced';
import { WorkoutDetailsLoading } from '@/components/workouts/WorkoutDetailsLoading';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkoutDetailsHeader } from '@/components/workouts/WorkoutDetailsHeader';
import { toast } from '@/hooks/use-toast';
import { ExerciseSet } from '@/types/exercise';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { EditWorkoutModal } from '@/components/EditWorkoutModal';
import { EditExerciseSetModal } from '@/components/EditExerciseSetModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useExerciseManagement } from '@/hooks/useExerciseManagement';
import { ExerciseDialog } from '@/components/ExerciseDialog';

// Define WorkoutDetails interface to match expected types
interface WorkoutDetails {
  id: string;
  name: string;
  training_type: string;
  start_time: string;
  end_time: string;
  duration: number;
  notes: string | null;
}

export default function WorkoutDetailsPage() {
  // Update to use workoutId from params
  const { workoutId } = useParams<{ workoutId: string }>();
  const { 
    workoutDetails, 
    exerciseSets, 
    loading, 
    error, 
    updateExerciseSet,
    setExerciseSets
  } = useWorkoutDetails(workoutId || '');
  
  const navigate = useNavigate();
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  // Exercise management setup
  const {
    exerciseSetModalOpen,
    setExerciseSetModalOpen,
    currentExercise,
    exerciseSetsToEdit,
    deleteAlertOpen,
    setDeleteAlertOpen,
    exerciseToDelete,
    showAddDialog,
    setShowAddDialog,
    handleSaveWorkoutEdit,
    handleEditExercise,
    handleSaveExerciseSets,
    handleAddExercise,
    handleDeleteExercise,
    confirmDeleteExercise
  } = useExerciseManagement(workoutId, setExerciseSets);
  
  const handleEditClick = () => {
    setEditModalOpen(true);
  };
  
  const handleDeleteClick = async () => {
    setDeleteAlertOpen(true);
  };

  // Wrapper function to handle the type mismatch with Promise<void>
  const handleSaveWorkout = async (updatedWorkout: WorkoutDetails): Promise<void> => {
    await handleSaveWorkoutEdit(updatedWorkout);
    // Function returns void as required by the interface
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
          
          {/* Edit Workout Modal */}
          <EditWorkoutModal
            workout={workoutDetails}
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            onSave={handleSaveWorkout}
          />
          
          {/* Edit Exercise Sets Modal */}
          <EditExerciseSetModal
            open={exerciseSetModalOpen}
            onOpenChange={setExerciseSetModalOpen}
            exerciseName={currentExercise}
            sets={exerciseSetsToEdit}
            onSave={handleSaveExerciseSets}
          />
          
          {/* Delete Workout Confirmation */}
          <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
            <AlertDialogContent className="bg-gray-900 border-gray-800">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Workout</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this workout? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-700 hover:bg-red-600"
                  onClick={handleDeleteExercise}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {/* Add Exercise Dialog - use proper props */}
          <ExerciseDialog
            open={showAddDialog}
            onOpenChange={setShowAddDialog}
            onSelect={handleAddExercise}
          />
        </div>
      )}
    </div>
  );
}
