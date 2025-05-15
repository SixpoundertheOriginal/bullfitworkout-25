
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ExerciseInput, ExerciseMetadata } from './types';

/**
 * Hook for creating new exercises
 */
export const useExerciseCreate = () => {
  const queryClient = useQueryClient();

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

  return {
    createExercise,
    isCreating
  };
};
