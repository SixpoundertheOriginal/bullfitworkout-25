
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ExerciseSet } from "@/types/exercise";

export function useWorkoutDetails(workoutId: string | undefined) {
  const [workoutDetails, setWorkoutDetails] = useState<any>(null);
  const [exerciseSets, setExerciseSets] = useState<Record<string, ExerciseSet[]>>({});
  const [loading, setLoading] = useState(workoutId ? true : false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkoutDetails = async () => {
    if (!workoutId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data: workout, error: workoutError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('id', workoutId)
        .single();
        
      if (workoutError) {
        console.error('Error fetching workout:', workoutError);
        setError('Error loading workout details');
        toast({
          title: "Error loading workout",
          description: workoutError.message,
          variant: "destructive"
        });
        return;
      }
      
      setWorkoutDetails(workout);
      
      const { data: sets, error: setsError } = await supabase
        .from('exercise_sets')
        .select('*')
        .eq('workout_id', workoutId)
        .order('exercise_name', { ascending: true })
        .order('set_number', { ascending: true });
        
      if (setsError) {
        console.error('Error fetching exercise sets:', setsError);
        setError('Error loading exercise data');
        toast({
          title: "Error loading exercise data",
          description: setsError.message,
          variant: "destructive"
        });
        return;
      }
      
      const groupedSets = sets?.reduce<Record<string, ExerciseSet[]>>((acc, set) => {
        if (!acc[set.exercise_name]) {
          acc[set.exercise_name] = [];
        }
        acc[set.exercise_name].push(set as ExerciseSet);
        return acc;
      }, {}) || {};
      
      setExerciseSets(groupedSets);
      
      // Process sets for the workout.exercises property
      if (workout) {
        workout.exercises = groupedSets;
      }
      
    } catch (err: any) {
      console.error('Error in workout details fetch:', err);
      setError(err.message || 'Failed to load workout data');
      toast({
        title: "Error",
        description: "Failed to load workout data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workoutId) {
      fetchWorkoutDetails();
    }
  }, [workoutId]);

  // Add functions for modifying exercise sets
  const addExerciseSet = async (newSet: Partial<ExerciseSet>) => {
    if (!workoutId || !workoutDetails) return;
    
    try {
      const { data, error: insertError } = await supabase
        .from('exercise_sets')
        .insert([{ ...newSet, workout_id: workoutId }])
        .select()
        .single();
        
      if (insertError) throw insertError;
      
      // Update local state
      setExerciseSets(prev => {
        const exerciseName = newSet.exercise_name as string;
        const updatedSets = { ...prev };
        
        if (!updatedSets[exerciseName]) {
          updatedSets[exerciseName] = [];
        }
        
        updatedSets[exerciseName] = [...updatedSets[exerciseName], data as ExerciseSet];
        
        // Also update workoutDetails.exercises
        if (workoutDetails) {
          workoutDetails.exercises = updatedSets;
          setWorkoutDetails({...workoutDetails});
        }
        
        return updatedSets;
      });
      
      toast({
        title: "Success",
        description: "Exercise set added",
      });
    } catch (err: any) {
      console.error('Error adding exercise set:', err);
      toast({
        title: "Error",
        description: "Failed to add exercise set",
        variant: "destructive"
      });
    }
  };

  const updateExerciseSet = async (updatedSet: ExerciseSet) => {
    if (!workoutId || !workoutDetails) return;
    
    try {
      const { error: updateError } = await supabase
        .from('exercise_sets')
        .update({
          weight: updatedSet.weight,
          reps: updatedSet.reps,
          completed: updatedSet.completed,
          rest_time: updatedSet.restTime || 60
        })
        .eq('id', updatedSet.id);
        
      if (updateError) throw updateError;
      
      // Update local state
      setExerciseSets(prev => {
        const updatedSets = { ...prev };
        const exerciseName = updatedSet.exercise_name;
        
        if (updatedSets[exerciseName]) {
          updatedSets[exerciseName] = updatedSets[exerciseName].map(set => 
            set.id === updatedSet.id ? updatedSet : set
          );
        }
        
        // Also update workoutDetails.exercises
        if (workoutDetails) {
          workoutDetails.exercises = updatedSets;
          setWorkoutDetails({...workoutDetails});
        }
        
        return updatedSets;
      });
    } catch (err: any) {
      console.error('Error updating exercise set:', err);
      toast({
        title: "Error",
        description: "Failed to update exercise set",
        variant: "destructive"
      });
    }
  };

  const deleteExerciseSet = async (setToDelete: ExerciseSet) => {
    if (!workoutId || !workoutDetails) return;
    
    try {
      const { error: deleteError } = await supabase
        .from('exercise_sets')
        .delete()
        .eq('id', setToDelete.id);
        
      if (deleteError) throw deleteError;
      
      // Update local state
      setExerciseSets(prev => {
        const updatedSets = { ...prev };
        const exerciseName = setToDelete.exercise_name;
        
        if (updatedSets[exerciseName]) {
          updatedSets[exerciseName] = updatedSets[exerciseName].filter(set => 
            set.id !== setToDelete.id
          );
          
          // Remove the exercise key if no sets remain
          if (updatedSets[exerciseName].length === 0) {
            delete updatedSets[exerciseName];
          }
        }
        
        // Also update workoutDetails.exercises
        if (workoutDetails) {
          workoutDetails.exercises = updatedSets;
          setWorkoutDetails({...workoutDetails});
        }
        
        return updatedSets;
      });
      
      toast({
        title: "Success",
        description: "Exercise set removed",
      });
    } catch (err: any) {
      console.error('Error deleting exercise set:', err);
      toast({
        title: "Error",
        description: "Failed to delete exercise set",
        variant: "destructive"
      });
    }
  };

  return { 
    workoutDetails, 
    exerciseSets, 
    loading, 
    error,
    setWorkoutDetails, 
    setExerciseSets,
    addExerciseSet,
    updateExerciseSet,
    deleteExerciseSet
  };
}
