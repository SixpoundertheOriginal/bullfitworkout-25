
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { updateWorkout, updateExerciseSets, addExerciseToWorkout, removeExerciseFromWorkout } from "@/services/workoutService";
import { ExerciseSet } from "@/types/exercise";

// Define a type for the update function to make the code more maintainable
type UpdateExerciseSetsFunction = (exerciseSets: Record<string, ExerciseSet[]> | ((prev: Record<string, ExerciseSet[]>) => Record<string, ExerciseSet[]>)) => void;

export function useExerciseManagement(workoutId: string | undefined, onUpdate: UpdateExerciseSetsFunction) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [exerciseSetModalOpen, setExerciseSetModalOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState("");
  const [exerciseSetsToEdit, setExerciseSetsToEdit] = useState<ExerciseSet[]>([]);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleSaveWorkoutEdit = async (updatedWorkout: any) => {
    if (!workoutId) return;
    
    try {
      const updated = await updateWorkout(workoutId, updatedWorkout);
      toast({
        title: "Workout updated successfully"
      });
      return updated;
    } catch (error) {
      console.error("Error updating workout:", error);
      toast({
        title: "Failed to update workout",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleEditExercise = (exerciseName: string, exerciseSets: Record<string, ExerciseSet[]>) => {
    const setsForExercise = exerciseSets[exerciseName];
    setCurrentExercise(exerciseName);
    setExerciseSetsToEdit(setsForExercise);
    setExerciseSetModalOpen(true);
  };

  const handleSaveExerciseSets = async (updatedSets: any[]): Promise<void> => {
    if (!workoutId || !currentExercise) return;
    
    try {
      // API expects this format
      const setsForApi = updatedSets.map(set => ({
        id: set.id || "",
        exercise_name: set.exercise_name,
        workout_id: set.workout_id || workoutId,
        weight: set.weight,
        reps: set.reps,
        set_number: set.set_number || 0,
        completed: set.completed,
        rest_time: set.restTime || set.rest_time || 60
      }));
      
      const updated = await updateExerciseSets(workoutId, currentExercise, setsForApi);
      toast({
        title: "Exercise sets updated"
      });
      
      // Convert the API response back to ExerciseSet format for the UI
      const convertedSets: ExerciseSet[] = updated.map(set => ({
        id: set.id,
        workout_id: set.workout_id,
        exercise_name: set.exercise_name,
        weight: set.weight,
        reps: set.reps,
        set_number: set.set_number,
        completed: set.completed,
        isEditing: false,
        restTime: set.rest_time || 60,
      }));
      
      // Create a new object first, then pass it to onUpdate
      onUpdate((prev: Record<string, ExerciseSet[]>) => {
        const newSets = { ...prev };
        newSets[currentExercise] = convertedSets;
        return newSets;
      });
      
    } catch (error) {
      console.error("Error updating exercise sets:", error);
      toast({
        title: "Failed to update exercise sets",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleAddExercise = async (exerciseName: string): Promise<void> => {
    if (!workoutId) return;
    
    try {
      const newSets = await addExerciseToWorkout(workoutId, exerciseName, 3);
      
      // Convert the API response to ExerciseSet format for the UI
      const convertedSets: ExerciseSet[] = newSets.map(set => ({
        id: set.id,
        workout_id: set.workout_id,
        exercise_name: set.exercise_name,
        weight: set.weight,
        reps: set.reps,
        set_number: set.set_number,
        completed: set.completed,
        isEditing: false,
        restTime: set.rest_time || 60,
      }));
      
      // Create a new object first, then pass it to onUpdate
      onUpdate((prev: Record<string, ExerciseSet[]>) => {
        const newSetsRecord = { ...prev };
        newSetsRecord[exerciseName] = convertedSets;
        return newSetsRecord;
      });
      
      toast({
        title: `Added ${exerciseName} to workout`
      });
    } catch (error) {
      console.error("Error adding exercise:", error);
      toast({
        title: "Failed to add exercise",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleDeleteExercise = async (): Promise<void> => {
    if (!workoutId || !exerciseToDelete) return;
    
    try {
      await removeExerciseFromWorkout(workoutId, exerciseToDelete);
      
      // Create a new object first, then pass it to onUpdate
      onUpdate((prev: Record<string, ExerciseSet[]>) => {
        const newSets = { ...prev };
        delete newSets[exerciseToDelete];
        return newSets;
      });
      
      toast({
        title: `Removed ${exerciseToDelete} from workout`
      });
      setDeleteAlertOpen(false);
      setExerciseToDelete("");
    } catch (error) {
      console.error("Error removing exercise:", error);
      toast({
        title: "Failed to remove exercise",
        variant: "destructive"
      });
    }
  };

  const confirmDeleteExercise = (exerciseName: string) => {
    setExerciseToDelete(exerciseName);
    setDeleteAlertOpen(true);
  };

  return {
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
    handleDeleteExercise,
    confirmDeleteExercise
  };
}
