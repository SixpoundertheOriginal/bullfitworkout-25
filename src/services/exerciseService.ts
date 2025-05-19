
/**
 * Exercise Service
 * Provides functions for interacting with exercise data
 */

import { Exercise } from '@/types/exercise';
import { ExerciseInput, ExerciseUpdateInput } from '@/hooks/exercise/types';
import { supabase } from '@/integrations/supabase/client';

// Helper function to transform database exercise to Exercise interface
const transformExerciseFromDb = (dbExercise: any): Exercise => {
  // Ensure instructions.steps is always a string array
  let instructions = dbExercise.instructions || {};
  if (typeof instructions === 'string') {
    try {
      instructions = JSON.parse(instructions);
    } catch (e) {
      instructions = { steps: [] };
    }
  }
  
  // Ensure we have a steps array
  if (!instructions.steps || !Array.isArray(instructions.steps)) {
    instructions.steps = [];
  }
  
  // Ensure variations is a string array
  let variations = dbExercise.variations || [];
  if (!Array.isArray(variations)) {
    variations = [];
  }
  
  return {
    ...dbExercise,
    instructions,
    variations,
    is_compound: dbExercise.is_compound === undefined ? false : dbExercise.is_compound
  };
};

// Helper function to prepare exercise for database insertion
const prepareExerciseForDb = (exercise: ExerciseInput | ExerciseUpdateInput) => {
  // Ensure is_compound is defined
  const is_compound = exercise.is_compound === undefined ? false : exercise.is_compound;
  
  // Ensure primary_muscle_groups is an array
  const primary_muscle_groups = Array.isArray(exercise.primary_muscle_groups) 
    ? exercise.primary_muscle_groups 
    : [];
  
  // Ensure secondary_muscle_groups is an array
  const secondary_muscle_groups = Array.isArray(exercise.secondary_muscle_groups)
    ? exercise.secondary_muscle_groups
    : [];
    
  // Ensure equipment_type is an array
  const equipment_type = Array.isArray(exercise.equipment_type) 
    ? exercise.equipment_type 
    : [];
    
  // Ensure instructions is properly formatted with steps as array
  let instructions = exercise.instructions || { steps: [] };
  if (typeof instructions === 'string') {
    try {
      instructions = JSON.parse(instructions);
    } catch (e) {
      instructions = { steps: [] };
    }
  }
  
  if (!instructions.steps || !Array.isArray(instructions.steps)) {
    instructions.steps = [];
  }
  
  // Ensure description is a string
  const description = exercise.description || '';
  
  // Ensure difficulty is defined
  const difficulty = exercise.difficulty || 'intermediate';

  // Ensure movement_pattern is defined
  const movement_pattern = exercise.movement_pattern || 'push';
  
  // Ensure name is defined
  const name = exercise.name || '';
  
  // Create a properly formatted object for database
  return {
    ...exercise,
    name,
    is_compound,
    primary_muscle_groups,
    secondary_muscle_groups,
    equipment_type,
    instructions,
    description,
    difficulty,
    movement_pattern
  };
};

/**
 * Fetch list of all exercises
 */
export async function listExercises(): Promise<Exercise[]> {
  // Fetch exercises from the database
  const { data, error } = await supabase
    .from('exercises')
    .select('*');

  if (error) {
    console.error('Error fetching exercises:', error);
    throw error;
  }

  // Transform each exercise to match the Exercise interface
  return (data || []).map(transformExerciseFromDb);
}

/**
 * Create a new exercise
 */
export async function createExercise(exercise: ExerciseInput): Promise<Exercise> {
  // Prepare exercise for database insertion
  const dbExercise = prepareExerciseForDb(exercise);

  const { data, error } = await supabase
    .from('exercises')
    .insert(dbExercise)
    .select()
    .single();

  if (error) {
    console.error('Error creating exercise:', error);
    throw error;
  }

  return transformExerciseFromDb(data);
}

/**
 * Update an existing exercise
 */
export async function updateExercise(exercise: ExerciseUpdateInput): Promise<Exercise> {
  // Prepare exercise for database update
  const dbExercise = prepareExerciseForDb(exercise);

  // Ensure all required fields are present for the database
  const exerciseToUpdate = {
    ...dbExercise,
    name: dbExercise.name || '', // Default to empty string if undefined
    description: dbExercise.description || '', // Default to empty string if undefined
    difficulty: dbExercise.difficulty || 'intermediate', // Default if undefined
    is_compound: dbExercise.is_compound === undefined ? false : dbExercise.is_compound,
    primary_muscle_groups: Array.isArray(dbExercise.primary_muscle_groups) ? dbExercise.primary_muscle_groups : [],
    equipment_type: Array.isArray(dbExercise.equipment_type) ? dbExercise.equipment_type : [],
    instructions: dbExercise.instructions || { steps: [] }
  };

  const { data, error } = await supabase
    .from('exercises')
    .update(exerciseToUpdate)
    .eq('id', exercise.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating exercise:', error);
    throw error;
  }

  return transformExerciseFromDb(data);
}

/**
 * Delete an exercise by id
 */
export async function deleteExercise(id: string): Promise<void> {
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting exercise:', error);
    throw error;
  }
}
