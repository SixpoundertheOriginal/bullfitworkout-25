
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Hook for deleting exercises
 */
export const useExerciseDelete = () => {
  const queryClient = useQueryClient();

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

  return {
    deleteExercise,
    isDeleting
  };
};
