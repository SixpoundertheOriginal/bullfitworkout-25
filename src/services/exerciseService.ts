
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
  return {
    ...exercise,
    // Ensure is_compound is set (required by db schema)
    is_compound: exercise.is_compound === undefined ? false : exercise.is_compound,
    // Ensure instructions is properly formatted
    instructions: exercise.instructions || { steps: [] }
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

  const { data, error } = await supabase
    .from('exercises')
    .update(dbExercise)
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
