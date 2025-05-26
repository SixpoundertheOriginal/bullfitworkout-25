
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { WorkoutExercises } from '@/store/workout/types';
import { ExerciseSet } from '@/store/workout/types';
import { AttemptRecoveryFn, HandleCompleteWorkoutFn } from '@/types/workout';
import { useTrainingSetupPersistence } from '@/hooks/useTrainingSetupPersistence';
import { useWorkoutStore } from '@/store/workout/store';
import { createDefaultSet } from '@/store/workout/actions';

/**
 * Hook that provides handler functions for the training session
 * PHASE 1: Fixed memoization to prevent re-initialization
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
  const workoutStore = useWorkoutStore();
  
  // One-time initialization log with stable reference
  const initMessage = useMemo(() => {
    console.log('useTrainingSessionHandlers: Hook initialized');
    return 'initialized';
  }, []);
  
  // Memoize saveTrainingPreferences to prevent re-creation
  const saveTrainingPreferences = useCallback((config: any) => {
    return saveConfig(config);
  }, [saveConfig]);

  // Memoize handleAddExercise with stable dependencies
  const handleAddExercise = useCallback((exerciseNameOrObject: string | any) => {
    console.log('useTrainingSessionHandlers: handleAddExercise called with:', exerciseNameOrObject);
    
    if (exerciseNameOrObject === '') {
      console.log('useTrainingSessionHandlers: Empty string passed, should open selection sheet');
      return;
    }
    
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
    
    const workoutId = workoutStore.workoutId;
    const newSets: ExerciseSet[] = Array.from({ length: 3 }, (_, i) => 
      createDefaultSet(exerciseName, i + 1, workoutId || undefined)
    );
    
    setExercises(prev => ({
      ...prev,
      [exerciseName]: newSets
    }));
    
    setFocusedExercise(exerciseName);
    
    toast({
      title: `${exerciseName} added to workout`,
      variant: "default"
    });
  }, [exercises, setExercises, setFocusedExercise, workoutStore.workoutId]);
  
  // Memoize handleAddSet with stable dependencies
  const handleAddSet = useCallback((exerciseName: string) => {
    setExercises(prev => {
      const currentSets = prev[exerciseName] || [];
      
      let weight = 0;
      let reps = 10;
      let nextSetNumber = 1;
      
      if (currentSets.length > 0) {
        const lastSet = currentSets[currentSets.length - 1];
        weight = lastSet.weight || 0;
        reps = lastSet.reps || 10;
        nextSetNumber = (lastSet.set_number || 0) + 1;
      }
      
      const workoutId = workoutStore.workoutId;
      const newSet = createDefaultSet(exerciseName, nextSetNumber, workoutId || undefined);
      newSet.weight = weight;
      newSet.reps = reps;
      
      return {
        ...prev,
        [exerciseName]: [...currentSets, newSet]
      };
    });
  }, [setExercises, workoutStore.workoutId]);
  
  // Memoize handleNextExercise with stable dependencies
  const handleNextExercise = useCallback((
    nextExerciseName: string | null, 
    handleFinishWorkout: () => Promise<string | null>,
    onAddExerciseCallback?: () => void
  ) => {
    console.log("useTrainingSessionHandlers: handleNextExercise called with", { 
      nextExerciseName, 
      hasAddExerciseCallback: !!onAddExerciseCallback 
    });
    
    setShowCompletionConfirmation(false);
    
    if (nextExerciseName) {
      setFocusedExercise(nextExerciseName);
    } else {
      if (onAddExerciseCallback && typeof onAddExerciseCallback === 'function') {
        setTimeout(() => {
          onAddExerciseCallback();
        }, 100);
      } else {
        toast({
          title: "All exercises completed!",
          description: "You've completed all exercises in this workout.",
          action: {
            label: "Finish Workout",
            onClick: handleFinishWorkout
          }
        });
      }
    }
  }, [setShowCompletionConfirmation, setFocusedExercise]);

  // Memoize handleCompleteExercise with stable dependencies
  const handleCompleteExercise = useCallback((exerciseName: string) => {
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

  // Memoize handleFinishWorkout with stable dependencies
  const handleFinishWorkout = useCallback(async (trainingConfigParam?: any) => {
    console.log("handleFinishWorkout called with config:", trainingConfigParam || trainingConfig);
    
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
    
    const { workoutId } = workoutStore;
    
    if (!workoutId) {
      toast({
        title: "Workout ID missing", 
        description: "Cannot save workout without a valid workout ID. Please start a new workout.",
        variant: "destructive"
      });
      return null;
    }
    
    const configToUse = trainingConfigParam || trainingConfig;
    try {
      const result = await rawHandleCompleteWorkout(configToUse);
      
      if (result) {
        if (configToUse) {
          saveTrainingPreferences(configToUse);
        }
        
        toast({
          title: "Workout saved successfully!",
          variant: "default"
        });
      } else {
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
  }, [completedSets, exercises, workoutStore.workoutId, trainingConfig, rawHandleCompleteWorkout, saveTrainingPreferences]);

  // Memoize attemptRecovery with stable dependencies
  const attemptRecovery = useCallback(async (
    workoutId: string, 
    source: 'manual' | 'auto' = 'manual', 
    meta: object = {}
  ) => {
    return rawAttemptRecovery(workoutId, source, meta);
  }, [rawAttemptRecovery]);

  // Memoize handleSubmitRating with stable dependencies
  const handleSubmitRating = useCallback((submitSetRating: (rpe: number) => void, setIsRatingSheetOpen: (open: boolean) => void) => (rpe: number) => {
    submitSetRating(rpe);
    setIsRatingSheetOpen(false);
  }, []);

  // Return memoized handlers object to prevent re-creation
  return useMemo(() => ({
    handleAddExercise,
    handleAddSet,
    handleFocusExercise: setFocusedExercise,
    handleCompleteExercise,
    handleNextExercise,
    handleFinishWorkout,
    attemptRecovery,
    handleSubmitRating
  }), [
    handleAddExercise,
    handleAddSet,
    setFocusedExercise,
    handleCompleteExercise,
    handleNextExercise,
    handleFinishWorkout,
    attemptRecovery,
    handleSubmitRating
  ]);
};
