import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Exercise, MuscleGroup, EquipmentType, MovementPattern, Difficulty } from '@/types/exercise';
import { toast } from '@/hooks/use-toast';

export type ExerciseMetadata = {
  default_weight?: number;
  default_reps?: number;
  weight_unit?: string;
  normalized_weight?: number;
  display_unit?: string;
};

type ExerciseInput = {
  name: string;
  description: string;
  user_id: string;
  primary_muscle_groups: MuscleGroup[] | string[];
  secondary_muscle_groups: MuscleGroup[] | string[];
  equipment_type: EquipmentType[] | string[];
  movement_pattern: MovementPattern;
  difficulty: Difficulty;
  instructions?: Record<string, any>;
  is_compound?: boolean;
  tips?: string[];
  variations?: string[];
  metadata?: Record<string, any>;
  created_at?: string;
  base_exercise_id?: string;
  variation_type?: string;
  variation_value?: string;
  is_bodyweight?: boolean;
  energy_cost_factor?: number;
};

type ExerciseUpdateInput = Partial<Omit<ExerciseInput, 'created_at'>> & { id: string };

export type ExerciseSortBy = 'name' | 'created_at' | 'difficulty';
export type SortOrder = 'asc' | 'desc';

export const useExercises = (initialSortBy: ExerciseSortBy = 'name', initialSortOrder: SortOrder = 'asc') => {
  const queryClient = useQueryClient();
  
  const { data: exercises, isLoading, error } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*');

      if (error) throw error;

      return data.map((exercise): Exercise => ({
        id: exercise.id,
        name: exercise.name,
        created_at: exercise.created_at || '',
        user_id: exercise.created_by || '', // Map created_by to user_id
        description: exercise.description || '',
        primary_muscle_groups: (exercise.primary_muscle_groups || []) as MuscleGroup[],
        secondary_muscle_groups: (exercise.secondary_muscle_groups || []) as MuscleGroup[],
        equipment_type: (exercise.equipment_type || []) as EquipmentType[],
        movement_pattern: (exercise.movement_pattern || 'push') as MovementPattern,
        difficulty: (exercise.difficulty || 'beginner') as Difficulty,
        instructions: (exercise.instructions || {}) as Record<string, any>,
        is_compound: exercise.is_compound || false,
        tips: exercise.tips || [],
        variations: exercise.variations || [],
        metadata: exercise.metadata as ExerciseMetadata || {},
        base_exercise_id: exercise.base_exercise_id || undefined,
        variation_type: exercise.variation_type || undefined,
        variation_value: exercise.variation_value || undefined,
        // Handle is_bodyweight from metadata if not directly available
        is_bodyweight: exercise.is_bodyweight !== undefined ? Boolean(exercise.is_bodyweight) : false,
        // Handle energy_cost_factor from metadata if not directly available
        energy_cost_factor: exercise.energy_cost_factor !== undefined ? exercise.energy_cost_factor : 1
      }));
    }
  });

  const { mutate: createExercise, isPending: isCreating } = useMutation({
    mutationFn: async (newExercise: ExerciseInput) => {
      console.log("Creating exercise with data:", newExercise);
      
      if (!newExercise.name || !newExercise.primary_muscle_groups || newExercise.primary_muscle_groups.length === 0) {
        throw new Error("Exercise name and at least one primary muscle group are required");
      }
      
      const { data, error } = await supabase
        .from('exercises')
        .insert([{
          name: newExercise.name,
          description: newExercise.description || '',
          primary_muscle_groups: newExercise.primary_muscle_groups,
          secondary_muscle_groups: newExercise.secondary_muscle_groups || [],
          equipment_type: newExercise.equipment_type || [],
          movement_pattern: newExercise.movement_pattern,
          difficulty: newExercise.difficulty,
          instructions: newExercise.instructions || {}, // Default empty object if not provided
          is_compound: Boolean(newExercise.is_compound),
          tips: newExercise.tips || [],
          variations: newExercise.variations || [],
          metadata: {
            ...(newExercise.metadata || {}),
            // Store is_bodyweight and energy_cost_factor in metadata if they're not direct columns
            is_bodyweight: newExercise.is_bodyweight,
            energy_cost_factor: newExercise.energy_cost_factor
          },
          created_by: newExercise.user_id || '',
          is_custom: true,
          base_exercise_id: newExercise.base_exercise_id || null,
          variation_type: newExercise.variation_type || null,
          variation_value: newExercise.variation_value || null,
          // Try sending these fields directly; if the DB schema supports them they'll be stored,
          // otherwise they'll be ignored but still available in metadata
          is_bodyweight: Boolean(newExercise.is_bodyweight),
          energy_cost_factor: newExercise.energy_cost_factor || 1
        }])
        .select();

      if (error) {
        console.error("Error creating exercise:", error);
        throw error;
      }
      
      console.log("Exercise created successfully:", data);
      return data[0];
    },
    onSuccess: () => {
      console.log("Invalidating exercises query cache");
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast({ title: "Exercise created successfully" });
    },
    onError: (error) => {
      console.error("Error in createExercise mutation:", error);
      toast({ 
        title: "Failed to create exercise", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // New mutation for updating exercises
  const { mutate: updateExercise, isPending: isUpdating } = useMutation({
    mutationFn: async (exercise: ExerciseUpdateInput) => {
      if (!exercise.id) {
        throw new Error("Exercise ID is required for updating");
      }
      
      console.log("Updating exercise with data:", exercise);
      
      // Destructure id from exercise and keep the rest as updateData
      const { id, ...updateData } = exercise;
      
      // Store is_bodyweight and energy_cost_factor in metadata as fallback
      const metadata = {
        ...(exercise.metadata || {}),
      };
      
      if (exercise.is_bodyweight !== undefined) {
        metadata.is_bodyweight = exercise.is_bodyweight;
      }
      
      if (exercise.energy_cost_factor !== undefined) {
        metadata.energy_cost_factor = exercise.energy_cost_factor;
      }
      
      const { data, error } = await supabase
        .from('exercises')
        .update({
          ...updateData,
          metadata
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error("Error updating exercise:", error);
        throw error;
      }
      
      console.log("Exercise updated successfully:", data);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast({ title: "Exercise updated successfully" });
    },
    onError: (error) => {
      console.error("Error in updateExercise mutation:", error);
      toast({ 
        title: "Failed to update exercise", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // New mutation for deleting exercises
  const { mutate: deleteExercise, isPending: isDeleting } = useMutation({
    mutationFn: async (exerciseId: string) => {
      console.log("Deleting exercise with id:", exerciseId);
      
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId);

      if (error) {
        console.error("Error deleting exercise:", error);
        throw error;
      }
      
      console.log("Exercise deleted successfully");
      return exerciseId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast({ title: "Exercise deleted successfully" });
    },
    onError: (error) => {
      console.error("Error in deleteExercise mutation:", error);
      toast({ 
        title: "Failed to delete exercise", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Return only base exercises (those without a base_exercise_id)
  const getBaseExercises = () => {
    if (!exercises) return [];
    return exercises.filter(exercise => !exercise.base_exercise_id);
  };

  // Return variations for a specific base exercise
  const getVariationsForExercise = (baseId: string) => {
    if (!exercises) return [];
    return exercises.filter(exercise => exercise.base_exercise_id === baseId);
  };

  // Sort exercises
  const getSortedExercises = (
    sortBy: ExerciseSortBy = initialSortBy, 
    sortOrder: SortOrder = initialSortOrder
  ) => {
    if (!exercises) return [];

    return [...exercises].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created_at':
          comparison = (new Date(a.created_at)).getTime() - (new Date(b.created_at)).getTime();
          break;
        case 'difficulty': {
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
          comparison = 
            (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
          break;
        }
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const isError = !!error;

  return {
    exercises: exercises || [],
    getSortedExercises,
    getBaseExercises,
    getVariationsForExercise,
    isLoading,
    error,
    createExercise,
    updateExercise,
    deleteExercise,
    isPending: isCreating,
    isCreating,
    isUpdating,
    isDeleting,
    isError
  };
};
