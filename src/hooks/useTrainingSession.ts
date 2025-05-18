
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useWorkoutStore } from '@/store/workout';
import { useWorkoutSave } from '@/hooks/useWorkoutSave';
import { useTrainingSetupPersistence } from '@/hooks/useTrainingSetupPersistence';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { shallow } from 'zustand/shallow';
import { ExerciseSet } from '@/types/exercise';

export const useTrainingSession = () => {
  const navigate = useNavigate();
  
  // Extract workout state from the store
  const {
    exercises,
    activeExercise,
    elapsedTime,
    isActive,
    workoutStatus,
    workoutId,
    restTimerActive,
    setExercises,
    handleCompleteSet,
    deleteExercise,
    trainingConfig,
    resetSession,
    startWorkout,
    endWorkout,
    postSetFlow,
    setPostSetFlow,
    lastCompletedExercise,
    lastCompletedSetIndex,
    focusedExercise,
    setFocusedExercise,
    submitSetRating,
    currentRestTime,
    setRestTimerActive: storeSetRestTimerActive
  } = useWorkoutStore(state => ({
    exercises: state.exercises,
    activeExercise: state.activeExercise,
    elapsedTime: state.elapsedTime,
    isActive: state.isActive,
    workoutStatus: state.workoutStatus,
    workoutId: state.workoutId,
    restTimerActive: state.restTimerActive,
    setExercises: state.setExercises,
    handleCompleteSet: state.handleCompleteSet,
    deleteExercise: state.deleteExercise,
    trainingConfig: state.trainingConfig,
    resetSession: state.resetSession,
    startWorkout: state.startWorkout,
    endWorkout: state.endWorkout,
    postSetFlow: state.postSetFlow,
    setPostSetFlow: state.setPostSetFlow,
    lastCompletedExercise: state.lastCompletedExercise,
    lastCompletedSetIndex: state.lastCompletedSetIndex,
    focusedExercise: state.focusedExercise,
    setFocusedExercise: state.setFocusedExercise,
    submitSetRating: state.submitSetRating,
    currentRestTime: state.currentRestTime,
    setRestTimerActive: state.setRestTimerActive
  }), shallow);

  // Training setup persistence
  const { storedConfig, saveConfig } = useTrainingSetupPersistence();
  
  // Adapt to our interface
  const loadTrainingConfig = useCallback(() => {
    return storedConfig;
  }, [storedConfig]);
  
  const saveTrainingPreferences = useCallback((config: any) => {
    return saveConfig(config);
  }, [saveConfig]);
  
  // Workout save logic
  const {
    saveStatus,
    handleCompleteWorkout,
    attemptRecovery,
    workoutId: savedWorkoutId
  } = useWorkoutSave(exercises, elapsedTime, resetSession);
  
  // UI State
  const [showRestTimerModal, setShowRestTimerModal] = useState(false);
  const [showEnhancedRestTimer, setShowEnhancedRestTimer] = useState(false);
  const [restTimerResetSignal, setRestTimerResetSignal] = useState(0);
  const [isAddExerciseSheetOpen, setIsAddExerciseSheetOpen] = useState(false);
  const [showCompletionConfirmation, setShowCompletionConfirmation] = useState(false);
  const [completedExerciseName, setCompletedExerciseName] = useState<string | null>(null);
  const [isRatingSheetOpen, setIsRatingSheetOpen] = useState(false);
  
  // Derived state
  const hasExercises = useMemo(() => Object.keys(exercises).length > 0, [exercises]);
  const exerciseCount = useMemo(() => Object.keys(exercises).length, [exercises]);
  
  const totalSets = useMemo(() => {
    return Object.values(exercises).reduce((total, sets) => total + sets.length, 0);
  }, [exercises]);
  
  const completedSets = useMemo(() => {
    return Object.values(exercises).reduce((total, sets) => {
      return total + sets.filter(set => set.completed).length;
    }, 0);
  }, [exercises]);
  
  const nextExerciseName = useMemo(() => {
    if (!focusedExercise) return null;
    
    const exerciseKeys = Object.keys(exercises);
    const currentIndex = exerciseKeys.indexOf(focusedExercise);
    
    if (currentIndex >= 0 && currentIndex < exerciseKeys.length - 1) {
      return exerciseKeys[currentIndex + 1];
    }
    
    return null;
  }, [exercises, focusedExercise]);
  
  const isSaving = workoutStatus === 'saving';
  
  // Initialize workout if coming from a setup flow
  useEffect(() => {
    // Only start if not already active and has exercises
    if (!isActive && hasExercises) {
      console.log('Starting new workout from existing exercises');
      startWorkout();
    } else if (!isActive && !hasExercises) {
      // Try to load saved config
      const config = loadTrainingConfig();
      if (config) {
        console.log('Found saved training config:', config);
      }
    }
  }, [isActive, hasExercises, startWorkout, loadTrainingConfig]);
  
  // Update UI state when post-set flow changes
  useEffect(() => {
    if (postSetFlow === 'rating') {
      setIsRatingSheetOpen(true);
    } else if (postSetFlow === 'resting') {
      setShowEnhancedRestTimer(true);
    }
  }, [postSetFlow]);
  
  // Specialized sets update handling that ensures proper types
  const handleSetExercises = useCallback((updater: any) => {
    if (typeof updater === 'function') {
      // Call function updater with current exercises state
      setExercises((currentExercises) => {
        try {
          // Log current state
          console.log('Current exercises state:', currentExercises);
          
          // Call updater to get new state
          const newExercises = updater(currentExercises);
          
          // Log the result
          console.log('New exercises state:', newExercises);
          
          // Return new state
          return newExercises;
        } catch (error) {
          console.error('Error updating exercises:', error);
          return currentExercises;
        }
      });
    } else {
      // Direct object update
      console.log('Directly setting exercises state:', updater);
      setExercises(updater);
    }
  }, [setExercises]);
  
  // Rest timer management
  const handleShowRestTimer = useCallback(() => {
    setShowRestTimerModal(true);
  }, []);
  
  const handleRestTimerComplete = useCallback(() => {
    setShowRestTimerModal(false);
    setShowEnhancedRestTimer(false);
    setPostSetFlow('idle');
  }, [setPostSetFlow]);
  
  const triggerRestTimerReset = useCallback(() => {
    setRestTimerResetSignal(prev => prev + 1);
  }, []);
  
  // Workout completion
  const handleFinishWorkout = useCallback(async () => {
    if (completedSets === 0) {
      toast({
        title: "No sets completed", 
        description: "Please complete at least one set before finishing your workout.",
        variant: "destructive"
      });
      return;
    }
    
    const result = await handleCompleteWorkout(trainingConfig);
    if (result) {
      // Save user's workout preferences
      if (trainingConfig) {
        saveTrainingPreferences(trainingConfig);
      }
      
      toast({
        title: "Workout saved successfully!",
        variant: "default"
      });
      navigate('/workout-complete', { replace: true });
    }
  }, [completedSets, handleCompleteWorkout, trainingConfig, navigate, saveTrainingPreferences]);
  
  // Exercise focus management
  const handleFocusExercise = useCallback((exerciseName: string) => {
    setFocusedExercise(exerciseName);
  }, [setFocusedExercise]);
  
  // Exercise management
  const handleAddExercise = useCallback((exerciseName: string) => {
    if (exercises[exerciseName]) {
      toast({
        title: `${exerciseName} is already in your workout`,
        description: "You can add additional sets to the existing exercise."
      });
      return;
    }
    
    // Add new exercise with default 3 sets
    const newSets = Array.from({ length: 3 }, (_, i) => ({
      id: `temp-${Date.now()}-${i}`,
      weight: 0,
      reps: 0,
      set_number: i + 1,
      completed: false,
      restTime: 60,
      isEditing: false
    } as ExerciseSet));
    
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
      // Safely access set_number with type checking
      const nextSetNumber = currentSets.length > 0 
        ? Math.max(...currentSets.map(s => 'set_number' in s && typeof s.set_number === 'number' ? s.set_number : 0)) + 1 
        : 1;
      
      // Get weight and reps from last set as a starting point
      let weight = 0;
      let reps = 0;
      
      if (currentSets.length > 0) {
        const lastSet = currentSets[currentSets.length - 1];
        weight = lastSet.weight || 0;
        reps = lastSet.reps || 0;
      }
      
      const newSet = {
        id: `temp-${Date.now()}`,
        weight,
        reps,
        set_number: nextSetNumber,
        completed: false,
        restTime: 60,
        isEditing: false
      } as ExerciseSet;
      
      return {
        ...prev,
        [exerciseName]: [...currentSets, newSet]
      };
    });
  }, [setExercises]);
  
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
  }, [setExercises]);
  
  const handleNextExercise = useCallback(() => {
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
  }, [nextExerciseName, setFocusedExercise, handleFinishWorkout]);
  
  // Rating submission
  const handleSubmitRating = useCallback((rpe: number) => {
    submitSetRating(rpe);
    setIsRatingSheetOpen(false);
  }, [submitSetRating]);

  // Get next set details for display in rest timer
  const getNextSetDetails = useCallback(() => {
    if (!lastCompletedExercise || lastCompletedSetIndex === null) {
      return null;
    }
    
    const exerciseSets = exercises[lastCompletedExercise];
    if (!exerciseSets) return null;
    
    // Check if there is a next set for this exercise
    const nextSetIndex = lastCompletedSetIndex + 1;
    if (nextSetIndex < exerciseSets.length) {
      const nextSet = exerciseSets[nextSetIndex];
      // Safely access set_number with type checking
      const setNumber = 'set_number' in nextSet ? nextSet.set_number : (nextSetIndex + 1);
      
      return {
        exerciseName: lastCompletedExercise,
        setNumber: setNumber,
        weight: nextSet.weight,
        reps: nextSet.reps,
        isLastSet: nextSetIndex === exerciseSets.length - 1
      };
    }
    
    // If no next set in current exercise, find the next exercise
    const exerciseNames = Object.keys(exercises);
    const currentExerciseIndex = exerciseNames.indexOf(lastCompletedExercise);
    const nextExerciseIndex = currentExerciseIndex + 1;
    
    if (nextExerciseIndex < exerciseNames.length) {
      const nextExercise = exerciseNames[nextExerciseIndex];
      const nextExerciseSets = exercises[nextExercise];
      
      if (nextExerciseSets && nextExerciseSets.length > 0) {
        const nextSet = nextExerciseSets[0];
        // Safely access set_number with type checking
        const setNumber = 'set_number' in nextSet ? nextSet.set_number : 1;
        
        return {
          exerciseName: nextExercise,
          setNumber: setNumber,
          weight: nextSet.weight,
          reps: nextSet.reps,
          isNewExercise: true
        };
      }
    }
    
    return null;
  }, [lastCompletedExercise, lastCompletedSetIndex, exercises]);
  
  // Handle setting rest timer active state
  const setRestTimerActiveState = useCallback((active: boolean) => {
    storeSetRestTimerActive(active);
  }, [storeSetRestTimerActive]);

  return {
    // State
    exercises,
    activeExercise,
    elapsedTime,
    hasExercises,
    exerciseCount,
    completedSets,
    totalSets,
    workoutStatus,
    workoutId,
    restTimerActive,
    isSaving,
    saveStatus,
    showRestTimerModal,
    showEnhancedRestTimer,
    restTimerResetSignal,
    currentRestTime,
    isAddExerciseSheetOpen,
    setIsAddExerciseSheetOpen,
    focusedExercise,
    showCompletionConfirmation,
    completedExerciseName,
    nextExerciseName,
    isRatingSheetOpen,
    setIsRatingSheetOpen,
    postSetFlow,
    lastCompletedExercise,
    lastCompletedSetIndex,
    trainingConfig,
    
    // Methods
    handleAddSet,
    handleAddExercise,
    handleShowRestTimer,
    handleRestTimerComplete,
    handleSubmitRating,
    handleFocusExercise,
    handleFinishWorkout,
    attemptRecovery,
    handleNextExercise,
    handleCompleteExercise,
    handleSetExercises,
    handleCompleteSet,
    deleteExercise,
    setFocusedExercise,
    triggerRestTimerReset,
    getNextSetDetails,
    
    // UI state setters
    setShowCompletionConfirmation,
    setPostSetFlow,
    setRestTimerActive: setRestTimerActiveState,
    setShowEnhancedRestTimer,
    setShowRestTimerModal
  };
};
