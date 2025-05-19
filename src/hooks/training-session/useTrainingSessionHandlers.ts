
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
  rawAttemptRecovery: (workoutId: string) => Promise<boolean>,
) => {
  const navigate = useNavigate();
  const { saveConfig } = useTrainingSetupPersistence();
  
  // Save training preferences to local storage
  const saveTrainingPreferences = useCallback((config: any) => {
    return saveConfig(config);
  }, [saveConfig]);

  // Exercise management
  const handleAddExercise = useCallback((exerciseName: string) => {
    if (exercises[exerciseName]) {
      toast({
        title: `${exerciseName} is already in your workout`,
        description: "You can add additional sets to the existing exercise."
      });
      return;
    }
    
    // Add new exercise with default 3 sets - with type-safe metadata
    const newSets: ExerciseSet[] = Array.from({ length: 3 }, (_, i) => ({
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
      
      if (currentSets.length > 0) {
        const lastSet = currentSets[currentSets.length - 1];
        weight = lastSet.weight || 0;
        reps = lastSet.reps || 0;
      }
      
      const newSet: ExerciseSet = {
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
  
  const handleFocusExercise = useCallback((exerciseName: string) => {
    setFocusedExercise(exerciseName);
  }, [setFocusedExercise]);
  
  const handleCompleteExercise = useCallback((exerciseName: string) => {
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
  }, [setExercises, setCompletedExerciseName, setShowCompletionConfirmation]);
  
  const handleNextExercise = useCallback((nextExerciseName: string | null, handleFinishWorkout: () => Promise<string | null>) => {
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
  }, [setShowCompletionConfirmation, setFocusedExercise]);

  // ❗ Avoid argument drift - implement wrapper with proper signature
  // Implementation of AttemptRecoveryFn
  const attemptRecovery: AttemptRecoveryFn = useCallback(async (
    workoutId: string, 
    source: 'manual' | 'auto' = 'manual', 
    meta: object = {}
  ) => {
    if (workoutId) {
      // Pass the expected workoutId
      return rawAttemptRecovery(workoutId);
    }
    return Promise.resolve(false);
  }, [rawAttemptRecovery]);
  
  // ❗ Avoid argument drift - implement wrapper with proper signature
  // Implementation of HandleCompleteWorkoutFn
  const handleFinishWorkout: HandleCompleteWorkoutFn = useCallback(async (trainingConfigParam?: any) => {
    if (completedSets === 0) {
      toast({
        title: "No sets completed", 
        description: "Please complete at least one set before finishing your workout.",
        variant: "destructive"
      });
      return null;
    }
    
    // Pass just the trainingConfig as the single required argument
    const configToUse = trainingConfigParam || trainingConfig;
    const result = await rawHandleCompleteWorkout(configToUse);
      
    if (result) {
      // Save user's workout preferences
      if (configToUse) {
        saveTrainingPreferences(configToUse);
      }
      
      toast({
        title: "Workout saved successfully!",
        variant: "default"
      });
      navigate('/workout-complete', { replace: true });
    }
    
    return result;
  }, [completedSets, rawHandleCompleteWorkout, trainingConfig, navigate, saveTrainingPreferences]);

  // Rating submission
  const handleSubmitRating = useCallback((submitSetRating: (rpe: number) => void, setIsRatingSheetOpen: (open: boolean) => void) => (rpe: number) => {
    submitSetRating(rpe);
    setIsRatingSheetOpen(false);
  }, []);

  return {
    handleAddExercise,
    handleAddSet,
    handleFocusExercise,
    handleCompleteExercise,
    handleNextExercise,
    handleFinishWorkout,
    attemptRecovery,
    handleSubmitRating
  };
};
