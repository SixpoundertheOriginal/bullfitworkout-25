import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { WorkoutExercises } from '@/store/workout/types';
import { ExerciseSet } from '@/store/workout/types';
import { AttemptRecoveryFn, HandleCompleteWorkoutFn } from '@/types/workout';
import { useTrainingSetupPersistence } from '@/hooks/useTrainingSetupPersistence';

/**
 * Hook that provides handler functions for the training session
 */
export const useTrainingSessionHandlers = (
  exercises: WorkoutExercises,
  completedSets: number,
  trainingConfig: any,
  setExercises: (exercises: WorkoutExercises | ((prev: WorkoutExercises) => WorkoutExercises)) => void,
  setFocusedExercise: (exerciseName: string | null) => void,
  setCompletedExerciseName: (name: string | null) => void,
  setShowCompletionConfirmation: (show: boolean) => void,
  rawHandleCompleteWorkout: HandleCompleteWorkoutFn,
  rawAttemptRecovery: AttemptRecoveryFn,
) => {
  const navigate = useNavigate();
  const { saveConfig } = useTrainingSetupPersistence();
  
  // Save training preferences to local storage
  const saveTrainingPreferences = useCallback((config: any) => {
    return saveConfig(config);
  }, [saveConfig]);

  // Exercise management - ensure we're always using exercise name (string)
  const handleAddExercise = useCallback((exerciseNameOrObject: string | any) => {
    // Make sure we always use the exercise name as string
    const exerciseName = typeof exerciseNameOrObject === 'string' 
      ? exerciseNameOrObject 
      : (exerciseNameOrObject?.name || "Unknown exercise");
    
    if (exercises[exerciseName]) {
      toast({
        title: `${exerciseName} is already in your workout`,
        description: "You can add additional sets to the existing exercise."
      });
      return;
    }
    
    // Add new exercise with default 3 sets - with type-safe metadata
    const newSets: ExerciseSet[] = Array.from({ length: 3 }, (_, i) => ({
      id: `temp-${exerciseName}-${i}`, // Temporary ID until saved
      workout_id: 'temp', // Temporary workout ID until saved
      exercise_name: exerciseName,
      set_number: i + 1,
      weight: 0,
      reps: 0,
      restTime: 60,
      completed: false,
      isEditing: false,
      metadata: { 
        autoAdjusted: false,
        previousValues: { weight: 0, reps: 0, restTime: 60 }
      }
    }));
    
    setExercises(prev => ({
      ...prev,
      [exerciseName]: newSets
    }));
    
    // Auto-focus the new exercise
    setFocusedExercise(exerciseName);
    
    toast({
      title: `${exerciseName} added to workout`,
      variant: "default"
    });
  }, [exercises, setExercises, setFocusedExercise]);
  
  const handleAddSet = useCallback((exerciseName: string) => {
    setExercises(prev => {
      const currentSets = prev[exerciseName] || [];
      
      // Get weight and reps from last set as a starting point
      let weight = 0;
      let reps = 0;
      let nextSetNumber = 1;
      
      if (currentSets.length > 0) {
        const lastSet = currentSets[currentSets.length - 1];
        weight = lastSet.weight || 0;
        reps = lastSet.reps || 0;
        nextSetNumber = (lastSet.set_number || 0) + 1;
      }
      
      const newSet: ExerciseSet = {
        id: `temp-${exerciseName}-${Date.now()}`,
        workout_id: 'temp',
        exercise_name: exerciseName,
        set_number: nextSetNumber,
        weight,
        reps,
        restTime: 60,
        completed: false,
        isEditing: false,
        metadata: { 
          autoAdjusted: false,
          previousValues: { weight, reps, restTime: 60 }
        }
      };
      
      return {
        ...prev,
        [exerciseName]: [...currentSets, newSet]
      };
    });
  }, [setExercises]);
  
  // ... keep existing code (remain handlers and functions)

  return {
    handleAddExercise,
    handleAddSet,
    handleFocusExercise: setFocusedExercise,
    handleCompleteExercise: (exerciseName: string) => {
      // Mark all sets as completed
      setExercises(prev => {
        const currentSets = prev[exerciseName] || [];
        return {
          ...prev,
          [exerciseName]: currentSets.map(set => ({ ...set, completed: true }))
        };
      });
      
      setCompletedExerciseName(exerciseName);
      setShowCompletionConfirmation(true);
    },
    handleNextExercise: (nextExerciseName: string | null, handleFinishWorkout: () => Promise<string | null>) => {
      setShowCompletionConfirmation(false);
      
      if (nextExerciseName) {
        setFocusedExercise(nextExerciseName);
      } else {
        // No more exercises, prompt to finish workout
        toast({
          title: "All exercises completed!",
          description: "You've completed all exercises in this workout.",
          action: {
            label: "Finish Workout",
            onClick: handleFinishWorkout
          }
        });
      }
    },
    handleFinishWorkout: async (trainingConfigParam?: any) => {
      console.log("handleFinishWorkout called with config:", trainingConfigParam || trainingConfig);
      console.log("Current completedSets:", completedSets);
      console.log("Current exercises:", Object.keys(exercises));
      
      if (completedSets === 0 && Object.keys(exercises).length === 0) {
        toast({
          title: "No exercises added", 
          description: "Please add at least one exercise before finishing your workout.",
          variant: "destructive"
        });
        return null;
      }
      
      if (completedSets === 0) {
        toast({
          title: "No sets completed", 
          description: "Please complete at least one set before finishing your workout.",
          variant: "destructive"
        });
        return null;
      }
      
      // Use the provided config or fall back to the injected one
      const configToUse = trainingConfigParam || trainingConfig;
      try {
        console.log("Calling rawHandleCompleteWorkout with config:", configToUse);
        const result = await rawHandleCompleteWorkout(configToUse);
        
        console.log("rawHandleCompleteWorkout returned:", result);
        
        if (result) {
          // Save user's workout preferences
          if (configToUse) {
            saveTrainingPreferences(configToUse);
          }
          
          toast({
            title: "Workout saved successfully!",
            variant: "default"
          });
        } else {
          console.error("Workout save returned null/undefined");
          toast({
            title: "Error saving workout",
            description: "Please try again",
            variant: "destructive" 
          });
        }
        
        return result;
      } catch (error) {
        console.error("Error in handleFinishWorkout:", error);
        toast({
          title: "Error saving workout",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive"
        });
        return null;
      }
    },
    attemptRecovery: async (
      workoutId: string, 
      source: 'manual' | 'auto' = 'manual', 
      meta: object = {}
    ) => {
      return rawAttemptRecovery(workoutId, source, meta);
    },
    handleSubmitRating: (submitSetRating: (rpe: number) => void, setIsRatingSheetOpen: (open: boolean) => void) => (rpe: number) => {
      submitSetRating(rpe);
      setIsRatingSheetOpen(false);
    }
  };
};
