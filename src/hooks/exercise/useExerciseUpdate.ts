import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ExerciseUpdateInput, ExerciseMetadata } from './types';

/**
 * Hook for updating exercises
 */
export const useExerciseUpdate = () => {
  const queryClient = useQueryClient();

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
      
      // Handle media_url specially - add to media_urls array in metadata
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

  return {
    updateExercise,
    isUpdating
  };
};
