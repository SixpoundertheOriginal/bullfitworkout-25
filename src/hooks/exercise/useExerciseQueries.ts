
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Exercise, MuscleGroup, EquipmentType, MovementPattern, Difficulty } from '@/types/exercise';
import { ExerciseSortBy, SortOrder, ExerciseMetadata } from './types';

/**
 * Hook for fetching and querying exercises
 */
export const useExerciseQueries = (initialSortBy: ExerciseSortBy = 'name', initialSortOrder: SortOrder = 'asc') => {
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
          
        // Extract media URL if present - improved safety checks
        let mediaUrl: string | undefined = undefined;
        
        // Safely check if metadata exists and contains media_urls array
        if (typeof exercise.metadata === 'object' && exercise.metadata !== null) {
          const metadata = exercise.metadata as Record<string, any>;
          // Check if media_urls exists and is an array with at least one item
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

  return {
    exercises: exercises || [],
    getBaseExercises,
    getVariationsForExercise,
    getSortedExercises,
    isLoading,
    error,
    isError: !!error
  };
};

