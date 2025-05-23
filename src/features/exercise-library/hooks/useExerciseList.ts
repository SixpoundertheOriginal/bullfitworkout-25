
import { useState, useEffect, useMemo } from 'react';
import { useExercises } from '@/hooks/exercise/useExerciseQueries';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { Exercise, MuscleGroup, EquipmentType, MovementPattern, Difficulty } from '@/types/exercise';

interface FilterOptions {
  searchQuery: string;
  selectedMuscleGroup: MuscleGroup | "all";
  selectedEquipment: EquipmentType | "all";
  selectedDifficulty: Difficulty | "all";
  selectedMovement: MovementPattern | "all";
}

export function useExerciseList(
  tab: "suggested" | "recent" | "browse",
  filters: FilterOptions,
  enablePagination: boolean = false
) {
  const { exercises = [] } = useExercises();
  const { workouts = [] } = useWorkoutHistory();
  
  const [currentPage, setCurrentPage] = useState(1);
  const exercisesPerPage = 8;

  // Extract filters
  const { searchQuery, selectedMuscleGroup, selectedEquipment, selectedDifficulty, selectedMovement } = filters;

  // Check if we're actively filtering
  const isFiltering = searchQuery !== '' || 
    selectedMuscleGroup !== 'all' || 
    selectedEquipment !== 'all' || 
    selectedDifficulty !== 'all' || 
    selectedMovement !== 'all';

  // Extract recently used exercises from workout history
  const recentExercises = useMemo(() => {
    if (!workouts?.length) return [];
    if (!Array.isArray(exercises) || exercises.length === 0) return [];
    
    const exerciseMap = new Map<string, Exercise>();
    
    // Get unique exercise names from recent workouts
    workouts.slice(0, 8).forEach(workout => {
      const exerciseNames = new Set<string>();
      
      if (workout.exerciseSets && Array.isArray(workout.exerciseSets)) {
        workout.exerciseSets.forEach(set => {
          if (set && set.exercise_name) {
            exerciseNames.add(set.exercise_name);
          }
        });
      }
      
      exerciseNames.forEach(name => {
        const exercise = exercises.find(e => e && e.name === name);
        if (exercise && !exerciseMap.has(exercise.id)) {
          exerciseMap.set(exercise.id, exercise);
        }
      });
    });
    
    return Array.from(exerciseMap.values());
  }, [workouts, exercises]);

  // Filter exercises based on search query and filters
  const filterExercises = (exercisesList: Exercise[] = []) => {
    if (!exercisesList || !Array.isArray(exercisesList)) return [];
    
    return exercisesList.filter(exercise => {
      if (!exercise) return false;
      
      // Search filter - include both name and variation info in search
      const searchableText = [
        exercise.name,
        exercise.description,
        exercise.variation_type,
        exercise.variation_value,
        ...(Array.isArray(exercise.primary_muscle_groups) ? exercise.primary_muscle_groups : []),
        ...(Array.isArray(exercise.secondary_muscle_groups) ? exercise.secondary_muscle_groups : [])
      ].filter(Boolean).join(' ').toLowerCase();
      
      const matchesSearch = searchQuery === "" || searchableText.includes(searchQuery.toLowerCase());

      // Muscle group filter
      const matchesMuscleGroup = selectedMuscleGroup === "all" || 
        (exercise.primary_muscle_groups && Array.isArray(exercise.primary_muscle_groups) && 
          exercise.primary_muscle_groups.includes(selectedMuscleGroup as MuscleGroup)) ||
        (exercise.secondary_muscle_groups && Array.isArray(exercise.secondary_muscle_groups) && 
          exercise.secondary_muscle_groups.includes(selectedMuscleGroup as MuscleGroup));

      // Equipment filter
      const matchesEquipment = selectedEquipment === "all" || 
        (exercise.equipment_type && Array.isArray(exercise.equipment_type) && 
          exercise.equipment_type.includes(selectedEquipment as EquipmentType));

      // Difficulty filter
      const matchesDifficulty = selectedDifficulty === "all" || 
        exercise.difficulty === selectedDifficulty;

      // Movement pattern filter
      const matchesMovement = selectedMovement === "all" || 
        exercise.movement_pattern === selectedMovement;

      return matchesSearch && matchesMuscleGroup && matchesEquipment && 
            matchesDifficulty && matchesMovement;
    });
  };

  // Get base exercises for each tab
  const getBaseExercises = useMemo(() => {
    if (!Array.isArray(exercises)) return [];
    
    // Filter out only base exercises (those without base_exercise_id)
    return exercises.filter(ex => ex && !ex.base_exercise_id);
  }, [exercises]);

  // Apply tab specific logic and filters
  const filteredExercises = useMemo(() => {
    switch (tab) {
      case 'recent':
        return filterExercises(recentExercises);
      case 'suggested':
        // For suggested tab, we show a mix of recent and some popular exercises
        return filterExercises(getBaseExercises.slice(0, 20)); // Just showing first 20 for now
      case 'browse':
      default:
        return filterExercises(getBaseExercises);
    }
  }, [tab, getBaseExercises, recentExercises, filters]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [tab, searchQuery, selectedMuscleGroup, selectedEquipment, selectedDifficulty, selectedMovement]);

  // Pagination logic
  const totalPages = Math.ceil(filteredExercises.length / exercisesPerPage);
  const currentExercises = enablePagination 
    ? filteredExercises.slice(
        (currentPage - 1) * exercisesPerPage, 
        currentPage * exercisesPerPage
      )
    : filteredExercises;

  return {
    filteredExercises,
    currentExercises,
    totalPages,
    currentPage,
    setCurrentPage,
    isFiltering
  };
}
