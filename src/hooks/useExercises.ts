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
  is_bodyweight?: boolean;
  energy_cost_factor?: number;
  variations?: any[]; // To store additional variations beyond the 1:1 field
  media_urls?: string[]; // To store multiple media URLs
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
  base_exercise_id?: string;
  variation_type?: string;
  variation_value?: string;
  is_bodyweight?: boolean;
  energy_cost_factor?: number;
  // New fields for media
  media_url?: string;
  variationList?: any[];
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

      return data.map((exercise): Exercise => {
        // Extract boolean flag safely from metadata if present
        const isBodyweight = typeof exercise.metadata === 'object' && exercise.metadata !== null && 
          'is_bodyweight' in exercise.metadata ? 
          Boolean(exercise.metadata.is_bodyweight) : false;
          
        // Extract number value safely from metadata if present  
        const energyCostFactor = typeof exercise.metadata === 'object' && exercise.metadata !== null && 
          'energy_cost_factor' in exercise.metadata ? 
          Number(exercise.metadata.energy_cost_factor) : 1;
          
        // Extract media URL if present - fixed to avoid TypeScript errors
        let mediaUrl: string | undefined = undefined;
        
        // Safely check if metadata exists and contains media_urls array
        if (typeof exercise.metadata === 'object' && exercise.metadata !== null) {
          const metadata = exercise.metadata as Record<string, any>;
          if (metadata.media_urls && Array.isArray(metadata.media_urls) && metadata.media_urls.length > 0) {
            mediaUrl = metadata.media_urls[0] as string;
          }
        }
          
        return {
          id: exercise.id,
          name: exercise.name,
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
          user_id: exercise.created_by || '',
          created_at: exercise.created_at,
          // Use the safely extracted values
          is_bodyweight: isBodyweight,
          energy_cost_factor: energyCostFactor,
          // Add media URL
          media_url: mediaUrl
        };
      });
    }
  });

  const { mutate: createExercise, isPending: isCreating } = useMutation({
    mutationFn: async (newExercise: ExerciseInput) => {
      console.log("Creating exercise with data:", newExercise);
      
      // Updated validation: only name is required, primary_muscle_groups is optional
      if (!newExercise.name) {
        throw new Error("Exercise name is required");
      }
      
      // Process variations list into legacy fields if needed
      let variation_type = newExercise.variation_type;
      let variation_value = newExercise.variation_value;
      
      // Initialize metadata object with all needed fields
      const metadata: ExerciseMetadata = {
        ...(newExercise.metadata || {}),
        // Store is_bodyweight and energy_cost_factor in metadata
        is_bodyweight: newExercise.is_bodyweight,
        energy_cost_factor: newExercise.energy_cost_factor || 1,
        // Initialize variations array if not present
        variations: []
      };
      
      // Add variationList to metadata if present
      if (newExercise.variationList && newExercise.variationList.length > 0) {
        metadata.variations = newExercise.variationList;
        
        // Use first variation for the legacy fields if not already set
        if (!variation_type && !variation_value) {
          variation_type = newExercise.variationList[0].type;
          variation_value = newExercise.variationList[0].value;
        }
      }
      
      // Add media_url to media_urls array in metadata if present
      if (newExercise.media_url) {
        if (!metadata.media_urls) {
          metadata.media_urls = [];
        }
        // Only add if it's not already in the array
        if (!metadata.media_urls.includes(newExercise.media_url)) {
          metadata.media_urls = [newExercise.media_url, ...metadata.media_urls].slice(0, 5); // Keep max 5 images
        }
      }
      
      const { data, error } = await supabase
        .from('exercises')
        .insert([{
          name: newExercise.name,
          description: newExercise.description || '',
          // Ensure we always pass an array for muscle groups, even if empty
          primary_muscle_groups: Array.isArray(newExercise.primary_muscle_groups) ? newExercise.primary_muscle_groups : [],
          secondary_muscle_groups: Array.isArray(newExercise.secondary_muscle_groups) ? newExercise.secondary_muscle_groups : [],
          equipment_type: Array.isArray(newExercise.equipment_type) ? newExercise.equipment_type : [],
          movement_pattern: newExercise.movement_pattern,
          difficulty: newExercise.difficulty,
          instructions: newExercise.instructions || {}, // Default empty object if not provided
          is_compound: Boolean(newExercise.is_compound),
          tips: newExercise.tips || [],
          variations: newExercise.variations || [],
          metadata: metadata,
          created_by: newExercise.user_id || '',
          is_custom: true,
          base_exercise_id: newExercise.base_exercise_id || null,
          variation_type: variation_type || null,
          variation_value: variation_value || null
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

  const { mutate: updateExercise, isPending: isUpdating } = useMutation({
    mutationFn: async (exercise: ExerciseUpdateInput) => {
      if (!exercise.id) {
        throw new Error("Exercise ID is required for updating");
      }
      
      console.log("Updating exercise with data:", exercise);
      
      // Destructure id from exercise and keep the rest as updateData
      const { id, ...updateData } = exercise;
      
      // Process variations list into legacy fields if needed
      let variation_type = updateData.variation_type;
      let variation_value = updateData.variation_value;
      
      // Initialize metadata object with all needed fields
      const metadata: ExerciseMetadata = {
        ...(updateData.metadata || {}),
        // Initialize variations array if not present
        variations: []
      };
      
      // Preserve the is_bodyweight setting if provided
      if (updateData.is_bodyweight !== undefined) {
        metadata.is_bodyweight = updateData.is_bodyweight;
      }
      
      // Preserve the energy_cost_factor if provided
      if (updateData.energy_cost_factor !== undefined) {
        metadata.energy_cost_factor = updateData.energy_cost_factor;
      }
      
      // Add variationList to metadata if present
      if (updateData.variationList && updateData.variationList.length > 0) {
        metadata.variations = updateData.variationList;
        
        // Use first variation for the legacy fields if not already set
        if (!variation_type && !variation_value) {
          variation_type = updateData.variationList[0].type;
          variation_value = updateData.variationList[0].value;
        }
        
        // Remove variationList from updateData since it's not a DB column
        delete updateData.variationList;
      }
      
      // Add media_url to media_urls array in metadata if present
      if (updateData.media_url) {
        if (!metadata.media_urls) {
          metadata.media_urls = [];
        }
        // Only add if it's not already in the array
        if (!metadata.media_urls.includes(updateData.media_url)) {
          metadata.media_urls = [updateData.media_url, ...metadata.media_urls].slice(0, 5); // Keep max 5 images
        }
      }
      
      const { data, error } = await supabase
        .from('exercises')
        .update({
          ...updateData,
          variation_type,
          variation_value,
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
          // Handle the case where created_at might be undefined
          const aDate = a.created_at ? new Date(a.created_at) : new Date(0);
          const bDate = b.created_at ? new Date(b.created_at) : new Date(0);
          comparison = aDate.getTime() - bDate.getTime();
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
