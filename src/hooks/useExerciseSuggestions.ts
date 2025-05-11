
import { useMemo } from "react";
import { Exercise, MuscleGroup } from "@/types/exercise";
import { useExercises } from "./useExercises";

export function useExerciseSuggestions(trainingType: string = "") {
  const { exercises = [] } = useExercises();

  const suggestedExercises = useMemo(() => {
    // Ensure exercises is an array
    if (!exercises || !Array.isArray(exercises) || !exercises.length) return [];

    // Filter exercises based on training type
    let filtered = [...(exercises || [])].filter(Boolean); // Ensure no undefined/null values
    
    if (trainingType?.toLowerCase() === "strength") {
      filtered = filtered.filter(e => 
        e.is_compound || 
        (e.equipment_type && Array.isArray(e.equipment_type) && e.equipment_type.some(t => ["barbell", "dumbbell", "machine"].includes(t))) ||
        // Check if primary_muscle_groups exists and is an array
        (e.primary_muscle_groups && Array.isArray(e.primary_muscle_groups) && 
         e.primary_muscle_groups.length > 0 &&
         e.primary_muscle_groups.some(m => ["chest", "back", "shoulders", "legs", "arms"].includes(m as string)))
      );
    } else if (trainingType?.toLowerCase() === "cardio") {
      filtered = filtered.filter(e => 
        (e.equipment_type && Array.isArray(e.equipment_type) && e.equipment_type.some(t => ["bodyweight", "cardio machine"].includes(t))) ||
        // Check if primary_muscle_groups exists and is an array
        (e.primary_muscle_groups && Array.isArray(e.primary_muscle_groups) && 
         e.primary_muscle_groups.length > 0 &&
         e.primary_muscle_groups.some(m => ["heart", "lungs", "full body"].includes(m as string)))
      );
    } else if (trainingType?.toLowerCase() === "yoga") {
      filtered = filtered.filter(e => 
        (e.equipment_type && Array.isArray(e.equipment_type) && e.equipment_type.includes("bodyweight")) ||
        // Check if primary_muscle_groups exists and is an array
        (e.primary_muscle_groups && Array.isArray(e.primary_muscle_groups) &&
         e.primary_muscle_groups.length > 0 &&
         e.primary_muscle_groups.some(m => ["core", "flexibility", "balance"].includes(m as string)))
      );
    } else if (trainingType?.toLowerCase() === "calisthenics") {
      filtered = filtered.filter(e => 
        (e.equipment_type && Array.isArray(e.equipment_type) && e.equipment_type.includes("bodyweight")) ||
        // Check if primary_muscle_groups exists and is an array
        (e.primary_muscle_groups && Array.isArray(e.primary_muscle_groups) &&
         e.primary_muscle_groups.length > 0 &&
         e.primary_muscle_groups.some(m => ["core", "chest", "back", "arms"].includes(m as string)))
      );
    }

    // Sort by compound exercises first
    filtered.sort((a, b) => {
      if (a.is_compound && !b.is_compound) return -1;
      if (!a.is_compound && b.is_compound) return 1;
      return 0;
    });

    return filtered.slice(0, 10);
  }, [exercises, trainingType]);

  return { suggestedExercises: suggestedExercises || [] };
}
