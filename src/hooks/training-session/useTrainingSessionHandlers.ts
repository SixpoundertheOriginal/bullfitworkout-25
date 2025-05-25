import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { WorkoutExercises } from '@/store/workout/types';
import { ExerciseSet } from '@/store/workout/types';
import { AttemptRecoveryFn, HandleCompleteWorkoutFn } from '@/types/workout';
import { useTrainingSetupPersistence } from '@/hooks/useTrainingSetupPersistence';
import { getStore } from '@/store/workout/store';
import { createDefaultSet, runWorkoutValidation } from '@/store/workout/actions';

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
  
  console.log('useTrainingSessionHandlers: Hook initialized');
  console.log('useTrainingSessionHandlers: Current exercises:', Object.keys(exercises));
  
  // Save training preferences to local storage
  const saveTrainingPreferences = useCallback((config: any) => {
    return saveConfig(config);
  }, [saveConfig]);

  // Exercise management - ensure we're always using exercise name (string)
  const handleAddExercise = useCallback((exerciseNameOrObject: string | any) => {
    console.log('useTrainingSessionHandlers: handleAddExercise called with:', exerciseNameOrObject);
    
    // If empty string is passed, open the exercise selection sheet instead
    if (exerciseNameOrObject === '') {
      console.log('useTrainingSessionHandlers: Empty string passed, should open selection sheet');
      return;
    }
    
    console.log('useTrainingSessionHandlers: Current exercises before adding:', Object.keys(exercises));
    
    // Make sure we always use the exercise name as string
    const exerciseName = typeof exerciseNameOrObject === 'string' 
      ? exerciseNameOrObject 
      : (exerciseNameOrObject?.name || "Unknown exercise");
    
    console.log('useTrainingSessionHandlers: Normalized exercise name:', exerciseName);
    
    if (exercises[exerciseName]) {
      console.log('useTrainingSessionHandlers: Exercise already exists, showing toast');
      toast({
        title: `${exerciseName} is already in your workout`,
        description: "You can add additional sets to the existing exercise."
      });
      return;
    }
    
    // Add new exercise with default 3 sets - ensure they're valid
    console.log('useTrainingSessionHandlers: Creating new valid sets for exercise:', exerciseName);
    const newSets: ExerciseSet[] = Array.from({ length: 3 }, (_, i) => 
      createDefaultSet(exerciseName, i + 1)
    );
    
    console.log('useTrainingSessionHandlers: Generated valid sets:', newSets);
    
    // Use both direct update and store update to ensure it works
    setExercises(prev => {
      console.log('useTrainingSessionHandlers: Setting exercises with callback');
      const newExercises = {
        ...prev,
        [exerciseName]: newSets
      };
      console.log('useTrainingSessionHandlers: New exercises state:', Object.keys(newExercises));
      return newExercises;
    });
    
    // Direct store update as a fallback (ensuring it's properly batched)
    setTimeout(() => {
      const store = getStore();
      const currentExercises = store.getState().exercises;
      
      // Only update if the exercise wasn't already added
      if (!currentExercises[exerciseName]) {
        store.getState().setExercises({
          ...currentExercises,
          [exerciseName]: newSets
        });
        console.log('useTrainingSessionHandlers: Direct store update completed');
      }
      
      // Verify the exercise was properly added
      setTimeout(() => {
        const storeExercises = getStore().getState().exercises;
        const wasAdded = !!storeExercises[exerciseName];
        console.log(`useTrainingSessionHandlers: Exercise "${exerciseName}" added successfully: ${wasAdded}`);
        if (wasAdded) {
          console.log('useTrainingSessionHandlers: Sets validity check:', 
            Array.isArray(storeExercises[exerciseName]) ? 
            `Valid sets: ${storeExercises[exerciseName].length} sets` : 
            'Invalid sets structure'
          );
          
          // Run validation to catch any issues immediately
          runWorkoutValidation();
        }
      }, 50);
    }, 10);
    
    // Auto-focus the new exercise
    setFocusedExercise(exerciseName);
    console.log('useTrainingSessionHandlers: Set focused exercise to:', exerciseName);
    
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
      let reps = 10;
      let nextSetNumber = 1;
      
      if (currentSets.length > 0) {
        const lastSet = currentSets[currentSets.length - 1];
        weight = lastSet.weight || 0;
        reps = lastSet.reps || 10;
        nextSetNumber = (lastSet.set_number || 0) + 1;
      }
      
      // Create a new valid set using the imported function
      const newSet = createDefaultSet(exerciseName, nextSetNumber);
      newSet.weight = weight;
      newSet.reps = reps;
      
      return {
        ...prev,
        [exerciseName]: [...currentSets, newSet]
      };
    });
  }, [setExercises]);
  
  // Enhanced handleNextExercise with better logging and ability to handle no-next-exercise scenario
  const handleNextExercise = useCallback((
    nextExerciseName: string | null, 
    handleFinishWorkout: () => Promise<string | null>,
    onAddExerciseCallback?: () => void // Added param for opening add exercise dialog
  ) => {
    console.log("useTrainingSessionHandlers: handleNextExercise called with", { 
      nextExerciseName, 
      hasAddExerciseCallback: !!onAddExerciseCallback 
    });
    
    setShowCompletionConfirmation(false);
    
    if (nextExerciseName) {
      console.log("useTrainingSessionHandlers: Focusing next exercise:", nextExerciseName);
      setFocusedExercise(nextExerciseName);
    } else {
      // No more exercises
      console.log("useTrainingSessionHandlers: No more exercises available");
      
      // If we have a callback to add exercises, we'll open the add exercise sheet
      if (onAddExerciseCallback && typeof onAddExerciseCallback === 'function') {
        console.log("useTrainingSessionHandlers: Opening add exercise dialog via callback");
        
        // Small delay to ensure UI state is updated properly
        setTimeout(() => {
          onAddExerciseCallback();
        }, 100);
      } else {
        // Fallback to toast with finish workout option
        console.log("useTrainingSessionHandlers: No add exercise callback provided, showing toast");
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
    handleNextExercise,
    handleFinishWorkout: async (trainingConfigParam?: any) => {
      console.log("handleFinishWorkout called with config:", trainingConfigParam || trainingConfig);
      console.log("Current completedSets:", completedSets);
      console.log("Current exercises:", Object.keys(exercises));
      
      // Enhanced input validation
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
      
      // Validate workout state before finishing
      const isValid = runWorkoutValidation();
      if (!isValid) {
        toast({
          title: "Workout data issues detected",
          description: "There were problems with your workout data that needed to be fixed. Please check your exercises.",
          variant: "destructive"
        });
        // Continue anyway since validateWorkoutState should have fixed issues
      }
      
      // Make sure workoutId exists
      const store = getStore();
      const { workoutId } = store.getState();
      
      if (!workoutId) {
        console.warn("❌ Missing workout ID. Generating temporary ID");
        // Generate and set temporary ID
        const tempId = `temp-${Date.now()}`;
        store.setState({ workoutId: tempId });
        toast({
          title: "Workout ID missing", 
          description: "Generated temporary ID to complete workout",
          variant: "destructive"  // Changed from "warning" to "destructive"
        });
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
