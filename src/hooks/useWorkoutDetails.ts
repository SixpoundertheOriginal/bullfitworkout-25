
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { groupBy } from 'lodash';
import { ExerciseSet } from '@/types/exercise';

export function useWorkoutDetails(workoutId: string) {
  const [workoutDetails, setWorkoutDetails] = useState<any>(null);
  const [exerciseSets, setExerciseSets] = useState<Record<string, ExerciseSet[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkoutDetails = async () => {
    setLoading(true);
    try {
      // Fetch workout details
      const { data: workout, error: workoutError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('id', workoutId)
        .single();

      if (workoutError) {
        throw workoutError;
      }

      setWorkoutDetails(workout);

      // Fetch exercise sets
      const { data: sets, error: setsError } = await supabase
        .from('exercise_sets')
        .select('*')
        .eq('workout_id', workoutId)
        .order('exercise_name', { ascending: true })
        .order('set_number', { ascending: true });

      if (setsError) {
        throw setsError;
      }

      // Group exercise sets by exercise name
      const groupedExercises = groupBy(sets || [], 'exercise_name');

      // Convert to expected format
      const formattedExercises: Record<string, ExerciseSet[]> = {};
      Object.entries(groupedExercises).forEach(([name, sets]) => {
        formattedExercises[name] = (sets as any[]).map((set: any) => ({
          weight: set.weight,
          reps: set.reps,
          restTime: set.rest_time || 60,
          completed: set.completed,
          isEditing: false,
          id: set.id
        }));
      });

      setExerciseSets(formattedExercises);
      setError(null);

    } catch (err: any) {
      console.error('Error fetching workout details:', err);
      setError(err.message || 'Failed to load workout details');
      toast({
        title: 'Error loading workout',
        description: err.message || 'Failed to load workout details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (workoutId) {
      fetchWorkoutDetails();
    }
  }, [workoutId]);

  // Function to update exercise sets
  const updateExerciseSet = async (
    exerciseName: string,
    setIndex: number,
    updatedSet: Partial<ExerciseSet>
  ) => {
    try {
      const currentSets = exerciseSets[exerciseName];
      if (!currentSets || !currentSets[setIndex]) {
        throw new Error('Exercise set not found');
      }

      const setId = currentSets[setIndex].id;
      if (!setId) {
        throw new Error('Exercise set ID is missing');
      }

      const { data, error } = await supabase
        .from('exercise_sets')
        .update({
          weight: updatedSet.weight,
          reps: updatedSet.reps,
          rest_time: updatedSet.restTime,
          completed: updatedSet.completed
        })
        .eq('id', setId)
        .select();

      if (error) {
        throw error;
      }

      // Update local state
      const newExerciseSets = { ...exerciseSets };
      newExerciseSets[exerciseName][setIndex] = {
        ...newExerciseSets[exerciseName][setIndex],
        ...updatedSet
      };
      setExerciseSets(newExerciseSets);

      return data;
    } catch (err: any) {
      console.error('Error updating exercise set:', err);
      toast({
        title: 'Error updating exercise set',
        description: err.message || 'Failed to update exercise set',
        variant: 'destructive'
      });
      throw err;
    }
  };

  return {
    workoutDetails,
    exerciseSets,
    loading,
    error,
    updateExerciseSet,
    setExerciseSets,
    refetch: fetchWorkoutDetails
  };
}
