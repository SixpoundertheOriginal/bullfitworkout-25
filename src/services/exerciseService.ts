
/**
 * Exercise Service
 * Provides functions for interacting with exercise data
 */

import { Exercise } from '@/types/exercise';
import { ExerciseInput, ExerciseUpdateInput } from '@/hooks/exercise/types';
import { supabase } from '@/integrations/supabase/client';

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

  return data || [];
}

/**
 * Create a new exercise
 */
export async function createExercise(exercise: ExerciseInput): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercises')
    .insert(exercise)
    .select()
    .single();

  if (error) {
    console.error('Error creating exercise:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing exercise
 */
export async function updateExercise(exercise: ExerciseUpdateInput): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercises')
    .update(exercise)
    .eq('id', exercise.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating exercise:', error);
    throw error;
  }

  return data;
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
