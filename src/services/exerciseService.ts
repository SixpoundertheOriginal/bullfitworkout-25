
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
  
  return {
    ...dbExercise,
    instructions: {
      steps: Array.isArray(instructions.steps) ? instructions.steps : [],
      video_url: instructions.video_url,
      image_url: instructions.image_url
    }
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
  const dbExercise = {
    ...exercise,
    // Ensure instructions is properly formatted for the database
    instructions: exercise.instructions || { steps: [] }
  };

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
  const dbExercise = {
    ...exercise,
    // Ensure instructions is properly formatted for the database if it exists
    ...(exercise.instructions && { 
      instructions: exercise.instructions
    })
  };

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
