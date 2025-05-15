
import { useState, useEffect, useMemo } from 'react';
import { Exercise, MuscleGroup, EquipmentType, MovementPattern, Difficulty } from '@/types/exercise';
import { useExercises } from '@/hooks/useExercises';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';

interface FilterOptions {
  searchQuery: string;
  selectedMuscleGroup: MuscleGroup | "all";
  selectedEquipment: EquipmentType | "all";
  selectedDifficulty: Difficulty | "all";
  selectedMovement: MovementPattern | "all";
}

export function useExerciseList(
  tab: "suggested" | "recent" | "browse",
  filterOptions: FilterOptions,
  paginated: boolean = false
) {
  const { exercises = [] } = useExercises();
  const { workouts = [] } = useWorkoutHistory();
  const [currentPage, setCurrentPage] = useState(1);
  const exercisesPerPage = 8;
  
  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filterOptions.searchQuery,
    filterOptions.selectedMuscleGroup,
    filterOptions.selectedEquipment, 
    filterOptions.selectedDifficulty,
    filterOptions.selectedMovement
  ]);

  // Get recent exercises from workout history
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

  // Filter exercises based on filters
  const filterExercises = (exercisesList: Exercise[] = []) => {
    if (!exercisesList || !Array.isArray(exercisesList) || exercisesList.length === 0) return [];
    
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
      
      const matchesSearch = filterOptions.searchQuery === "" || 
        searchableText.includes(filterOptions.searchQuery.toLowerCase());

      // Muscle group filter
      const matchesMuscleGroup = filterOptions.selectedMuscleGroup === "all" || 
        (exercise.primary_muscle_groups && Array.isArray(exercise.primary_muscle_groups) && 
          exercise.primary_muscle_groups.includes(filterOptions.selectedMuscleGroup as MuscleGroup)) ||
        (exercise.secondary_muscle_groups && Array.isArray(exercise.secondary_muscle_groups) && 
          exercise.secondary_muscle_groups.includes(filterOptions.selectedMuscleGroup as MuscleGroup));

      // Equipment filter
      const matchesEquipment = filterOptions.selectedEquipment === "all" || 
        (exercise.equipment_type && Array.isArray(exercise.equipment_type) && 
          exercise.equipment_type.includes(filterOptions.selectedEquipment as EquipmentType));

      // Difficulty filter
      const matchesDifficulty = filterOptions.selectedDifficulty === "all" || 
        exercise.difficulty === filterOptions.selectedDifficulty;

      // Movement pattern filter
      const matchesMovement = filterOptions.selectedMovement === "all" || 
        exercise.movement_pattern === filterOptions.selectedMovement;

      return matchesSearch && matchesMuscleGroup && matchesEquipment && 
            matchesDifficulty && matchesMovement;
    });
  };

  // Get the base exercises (those without base_exercise_id)
  const baseExercises = useMemo(() => {
    return Array.isArray(exercises) 
      ? exercises.filter(ex => ex && !ex.base_exercise_id) 
      : [];
  }, [exercises]);

  // Get filtered exercises based on the active tab
  const filteredExercises = useMemo(() => {
    switch(tab) {
      case "suggested":
        // Suggested shows the first 20 base exercises
        return filterExercises(baseExercises.slice(0, 20));
      case "recent":
        // Recent shows exercises from workout history
        return filterExercises(recentExercises);
      case "browse":
      default:
        // Browse shows all base exercises
        return filterExercises(baseExercises);
    }
  }, [tab, baseExercises, recentExercises, filterOptions]);

  // Pagination logic for the browse tab
  const { currentExercises, totalPages } = useMemo(() => {
    if (!paginated) {
      return { currentExercises: filteredExercises, totalPages: 1 };
    }
    
    const indexOfLastExercise = currentPage * exercisesPerPage;
    const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
    const slicedExercises = filteredExercises.slice(indexOfFirstExercise, indexOfLastExercise);
    const total = Math.ceil(filteredExercises.length / exercisesPerPage);
    
    return { 
      currentExercises: slicedExercises, 
      totalPages: total 
    };
  }, [filteredExercises, currentPage, paginated]);

  return {
    filteredExercises,
    currentExercises,
    totalPages,
    currentPage,
    setCurrentPage
  };
}
