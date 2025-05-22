
import { useMemo } from 'react';
import { useExerciseQueries } from './useExerciseQueries';
import { MuscleGroup, Exercise } from '@/types/exercise';
import { ExerciseSortBy, SortOrder } from './types';

export function useExercisesUtil() {
  const {
    exercises,
    isLoading,
    error,
    isError,
    createExercise,
    updateExercise,
    deleteExercise,
    isPending,
    isCreating,
    isUpdating,
    isDeleting,
  } = useExerciseQueries();

  // Get base exercises (exercises without a parent)
  const baseExercises = useMemo(() => {
    return exercises.filter((ex) => !ex.base_exercise_id);
  }, [exercises]);

  // Get exercise variations for a specific base exercise
  const getVariationsForExercise = (baseExerciseId: string) => {
    return exercises.filter((ex) => ex.base_exercise_id === baseExerciseId);
  };

  // Filter exercises by muscle group
  const filterByMuscleGroup = (muscleGroup: MuscleGroup) => {
    return exercises.filter((ex) => {
      const primaryMuscles = ex.primary_muscle_groups || [];
      const secondaryMuscles = ex.secondary_muscle_groups || [];
      return primaryMuscles.includes(muscleGroup) || secondaryMuscles.includes(muscleGroup);
    });
  };

  // Filter exercises by equipment type
  const filterByEquipment = (equipmentType: string) => {
    return exercises.filter((ex) => {
      const equipment = ex.equipment_type || [];
      return equipment.includes(equipmentType);
    });
  };

  // Search exercises by name or description
  const searchExercises = (query: string) => {
    if (!query.trim()) return exercises;
    
    const searchTerms = query.toLowerCase().trim().split(/\s+/);
    
    return exercises.filter((ex) => {
      const name = ex.name?.toLowerCase() || '';
      const description = ex.description?.toLowerCase() || '';
      const muscleGroups = [...(ex.primary_muscle_groups || []), ...(ex.secondary_muscle_groups || [])].join(' ').toLowerCase();
      
      // Check if all search terms are found in any of the searchable fields
      return searchTerms.every(term => 
        name.includes(term) || 
        description.includes(term) || 
        muscleGroups.includes(term)
      );
    });
  };

  // Sort exercises by different criteria
  const sortExercises = (exercises: Exercise[], sortBy: ExerciseSortBy = 'name', sortOrder: SortOrder = 'asc') => {
    return [...exercises].sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      switch (sortBy) {
        case 'name':
          valueA = a.name?.toLowerCase() || '';
          valueB = b.name?.toLowerCase() || '';
          break;
        case 'difficulty':
          valueA = a.difficulty || '';
          valueB = b.difficulty || '';
          break;
        case 'muscle_group':
          valueA = (a.primary_muscle_groups || [])[0] || '';
          valueB = (b.primary_muscle_groups || [])[0] || '';
          break;
        default:
          valueA = a.name?.toLowerCase() || '';
          valueB = b.name?.toLowerCase() || '';
      }
      
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  };

  // Get frequently used exercises
  const getFrequentlyUsedExercises = (limit = 10) => {
    // In a real implementation, this would use actual usage data
    // For now, we'll just return some base exercises
    return baseExercises.slice(0, limit);
  };

  // Get suggested exercises based on muscle groups
  const getSuggestedExercises = (targetMuscleGroups: MuscleGroup[] = [], limit = 10) => {
    if (targetMuscleGroups.length === 0) {
      return getFrequentlyUsedExercises(limit);
    }
    
    const matchingExercises = exercises.filter(ex => {
      const primaryMuscles = ex.primary_muscle_groups || [];
      return targetMuscleGroups.some(muscle => primaryMuscles.includes(muscle));
    });
    
    return matchingExercises.slice(0, limit);
  };

  return {
    exercises,
    baseExercises,
    isLoading,
    error,
    isError,
    createExercise,
    updateExercise,
    deleteExercise,
    isPending,
    isCreating,
    isUpdating,
    isDeleting,
    getVariationsForExercise,
    filterByMuscleGroup,
    filterByEquipment,
    searchExercises,
    sortExercises,
    getFrequentlyUsedExercises,
    getSuggestedExercises,
  };
}
