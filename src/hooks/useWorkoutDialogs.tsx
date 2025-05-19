
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExerciseDialog } from '@/components/ExerciseDialog';
import { EditWorkoutModal } from '@/components/EditWorkoutModal';
import { EditExerciseSetModal } from '@/components/EditExerciseSetModal';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { useExerciseManagement } from '@/hooks/useExerciseManagement';
import { useDeleteOperation } from '@/hooks/useAsyncOperation';
import { deleteWorkout } from '@/services/workoutService';
import { ExerciseSet } from '@/store/workout/types';

interface UseWorkoutDialogsProps {
  workoutId: string | undefined;
  workoutDetails: any;
  setExerciseSets: React.Dispatch<React.SetStateAction<Record<string, ExerciseSet[]>>>;
  setWorkoutDetails: React.Dispatch<React.SetStateAction<any>>;
}

export const useWorkoutDialogs = ({
  workoutId,
  workoutDetails,
  setExerciseSets,
  setWorkoutDetails
}: UseWorkoutDialogsProps) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const {
    editModalOpen,
    setEditModalOpen,
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
    handleDeleteExercise
  } = useExerciseManagement(workoutId, setExerciseSets);

  const deleteWorkoutOperation = useDeleteOperation(deleteWorkout, {
    successMessage: "Workout deleted successfully",
    errorMessage: "Failed to delete workout",
    redirectPath: "/training?tab=history",
    navigate
  });

  // Dialog action handlers
  const handlers = {
    openEditWorkoutModal: () => setEditModalOpen(true),
    closeEditWorkoutModal: () => setEditModalOpen(false),
    openDeleteWorkoutDialog: () => setDeleteDialogOpen(true),
    closeDeleteWorkoutDialog: () => setDeleteDialogOpen(false),
    deleteWorkout: () => deleteWorkoutOperation.execute(workoutId!),
    editExercise: handleEditExercise,
    saveExerciseSets: handleSaveExerciseSets,
    addExercise: handleAddExercise,
    deleteExercise: handleDeleteExercise,
    saveWorkoutEdit: async (updated: any) => {
      const saved = await handleSaveWorkoutEdit(updated);
      if (saved) setWorkoutDetails(saved);
    }
  };

  // Rendered dialog components
  const dialogs = (
    <>
      <EditWorkoutModal
        workout={workoutDetails}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={handlers.saveWorkoutEdit}
      />
      
      <EditExerciseSetModal
        sets={exerciseSetsToEdit}
        exerciseName={currentExercise}
        open={exerciseSetModalOpen}
        onOpenChange={setExerciseSetModalOpen}
        onSave={handlers.saveExerciseSets}
      />
      
      <ExerciseDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={async ex => ex.name && handleAddExercise(ex.name)}
        mode="add"
      />
      
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {currentExercise}? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteExercise}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workout? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlers.deleteWorkout}
              disabled={deleteWorkoutOperation.isLoading}
            >
              {deleteWorkoutOperation.isLoading
                ? <><Loader2 className="animate-spin mr-2 h-4 w-4"/>Deleting...</>
                : "Delete Workout"
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  return { handlers, dialogs, isLoading: deleteWorkoutOperation.isLoading };
};
