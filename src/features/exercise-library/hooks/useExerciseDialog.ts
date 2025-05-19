
import { useState } from "react";
import { useExercises } from "@/hooks/useExercises";
import { Exercise, MuscleGroup, MovementPattern, Difficulty, EquipmentType } from "@/types/exercise";
import { useToast } from "@/hooks/use-toast";
import { ExerciseInput, ExerciseUpdateInput } from "@/hooks/exercise/types";

export function useExerciseDialog(user: any, standalone: boolean) {
  const { createExercise, updateExercise, deleteExercise, isPending } = useExercises();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  
  // For delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);

  // For add/edit
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);
  const [baseExerciseForVariation, setBaseExerciseForVariation] = useState<Exercise | null>(null);

  const handleAdd = () => {
    // Check if user is authenticated
    if (!user || !user.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create exercises",
        variant: "destructive"
      });
      return;
    }
    
    setExerciseToEdit(null);
    setBaseExerciseForVariation(null);
    setDialogMode("add");
    setShowDialog(true);
  };

  const handleEdit = (exercise: Exercise) => {
    // Check if user is authenticated
    if (!user || !user.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to edit exercises",
        variant: "destructive"
      });
      return;
    }
    
    setExerciseToEdit(exercise);
    setBaseExerciseForVariation(null);
    setDialogMode("edit");
    setShowDialog(true);
  };
  
  const handleAddVariation = (baseExercise: Exercise) => {
    // Check if user is authenticated
    if (!user || !user.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create exercise variations",
        variant: "destructive"
      });
      return;
    }
    
    setExerciseToEdit(null);
    setBaseExerciseForVariation(baseExercise);
    setDialogMode("add");
    setShowDialog(true);
  };
  
  const handleDelete = (exercise: Exercise) => {
    // Check if user is authenticated
    if (!user || !user.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to delete exercises",
        variant: "destructive"
      });
      return;
    }
    
    setExerciseToDelete(exercise);
    setDeleteConfirmOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!exerciseToDelete) return;
    
    try {
      await deleteExercise(exerciseToDelete.id);
      toast({
        title: "Exercise deleted",
        description: `${exerciseToDelete.name} has been removed from your library`,
      });
    } catch (err) {
      console.error("Error deleting exercise:", err);
      toast({
        title: "Failed to delete exercise",
        description: "An error occurred while deleting the exercise",
        variant: "destructive"
      });
    }
    
    setDeleteConfirmOpen(false);
    setExerciseToDelete(null);
  };

  // Add/Edit handler
  const handleDialogSubmit = async (exercise: {
    name: string;
    description: string;
    primary_muscle_groups: MuscleGroup[];
    secondary_muscle_groups: MuscleGroup[];
    equipment_type: string[];
    movement_pattern: MovementPattern;
    difficulty: Difficulty;
    instructions?: { steps: string[]; form?: string };
    is_compound?: boolean;
    tips?: string[];
    variations?: string[];
    metadata?: Record<string, any>;
    is_bodyweight?: boolean;
    energy_cost_factor?: number;
    base_exercise_id?: string;
    variation_type?: string;
    variation_value?: string;
    variationList?: any[];
  }) => {
    // Check if user is authenticated
    if (!user || !user.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save exercises",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (dialogMode === "add") {
        await new Promise(resolve => setTimeout(resolve, 350));
        await new Promise<void>((resolve, reject) => {
          const exerciseInput: ExerciseInput = {
            ...exercise,
            user_id: user.id,
            primary_muscle_groups: Array.isArray(exercise.primary_muscle_groups) ? exercise.primary_muscle_groups : [],
            secondary_muscle_groups: Array.isArray(exercise.secondary_muscle_groups) ? exercise.secondary_muscle_groups : [],
            equipment_type: Array.isArray(exercise.equipment_type) ? exercise.equipment_type : [],
            instructions: {
              steps: Array.isArray(exercise.instructions?.steps) ? exercise.instructions.steps : [],
              video_url: exercise.instructions?.form,
            }
          };
          
          createExercise(exerciseInput, {
            onSuccess: () => resolve(),
            onError: err => reject(err),
          });
        });
        
        toast({
          title: baseExerciseForVariation ? "Variation added" : "Exercise added",
          description: baseExerciseForVariation 
            ? `Added variation to ${baseExerciseForVariation.name}`
            : `Added ${exercise.name} to your library`
        });
        
        setShowDialog(false);
      } else if (dialogMode === "edit" && exerciseToEdit) {
        const updateInput: ExerciseUpdateInput = {
          id: exerciseToEdit.id as string,
          ...exercise,
          user_id: user.id,
          primary_muscle_groups: Array.isArray(exercise.primary_muscle_groups) ? exercise.primary_muscle_groups : [],
          secondary_muscle_groups: Array.isArray(exercise.secondary_muscle_groups) ? exercise.secondary_muscle_groups : [],
          equipment_type: Array.isArray(exercise.equipment_type) ? exercise.equipment_type : [],
          instructions: {
            steps: Array.isArray(exercise.instructions?.steps) ? exercise.instructions.steps : [],
            video_url: exercise.instructions?.form,
          }
        };
          
        await updateExercise(updateInput);
        
        toast({
          title: "Exercise updated",
          description: `Updated ${exercise.name} in your library`
        });
        
        setShowDialog(false);
      }
    } catch (error) {
      console.error("Error handling exercise submission:", error);
      toast({
        title: "Error",
        description: "Failed to save exercise. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    showDialog,
    setShowDialog,
    dialogMode,
    exerciseToEdit,
    baseExerciseForVariation,
    handleAdd,
    handleEdit,
    handleAddVariation,
    handleDelete,
    handleDialogSubmit,
    isPending,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    exerciseToDelete,
    confirmDelete
  };
}
