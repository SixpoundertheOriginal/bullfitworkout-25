
import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { useWorkoutStore } from '@/store/workoutStore';
import { useSound } from '@/hooks/useSound';
import { TrainingConfig } from '@/hooks/useTrainingSetupPersistence';
import { useWorkoutSave } from "@/hooks/useWorkoutSave";
import { adaptExerciseSets, adaptToStoreFormat } from "@/utils/exerciseAdapter";

export function useTrainingSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const { play: playBell } = useSound('/sounds/bell.mp3');
  const { play: playTick } = useSound('/sounds/tick.mp3');
  const { play: playSuccess } = useSound('/sounds/success.mp3');
  
  const {
    exercises: storeExercises,
    setExercises: setStoreExercises,
    activeExercise,
    setActiveExercise,
    elapsedTime,
    resetSession,
    restTimerActive,
    setRestTimerActive,
    currentRestTime,
    setCurrentRestTime,
    handleCompleteSet,
    workoutStatus,
    markAsSaving,
    markAsFailed,
    workoutId,
    deleteExercise,
    startWorkout,
    updateLastActiveRoute,
    trainingConfig,
    isActive,
    setTrainingConfig,
    setWorkoutStatus,
    focusedExercise,
    focusedSetIndex,
    setFocusedExercise,
    setFocusedSetIndex,
    postSetFlow,
    setPostSetFlow,
    lastCompletedExercise,
    lastCompletedSetIndex,
    submitSetRating
  } = useWorkoutStore();
  
  // Initialize the useWorkoutSave hook
  const { 
    handleCompleteWorkout,
    saveStatus,
    savingErrors,
    workoutId: savedWorkoutId 
  } = useWorkoutSave(storeExercises, elapsedTime, resetSession);

  // Convert store exercises to the format expected by components
  const exercises = adaptExerciseSets(storeExercises);
  
  const [completedSets, totalSets] = Object.entries(exercises).reduce(
    ([completed, total], [_, sets]) => [
      completed + sets.filter(s => s.completed).length,
      total + sets.length
    ],
    [0, 0]
  );
  
  const [isAddExerciseSheetOpen, setIsAddExerciseSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showRestTimerModal, setShowRestTimerModal] = useState(false);
  const [showEnhancedRestTimer, setShowEnhancedRestTimer] = useState(false);
  const [restTimerResetSignal, setRestTimerResetSignal] = useState(0);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [nextSetRecommendation, setNextSetRecommendation] = useState(null);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [volumeStats, setVolumeStats] = useState('');
  const [showCompletionConfirmation, setShowCompletionConfirmation] = useState(false);
  const [completedExerciseName, setCompletedExerciseName] = useState<string | null>(null);
  const [nextExerciseName, setNextExerciseName] = useState<string | null>(null);
  const [isRatingSheetOpen, setIsRatingSheetOpen] = useState(false);

  const exerciseCount = Object.keys(exercises).length;
  const hasExercises = exerciseCount > 0;

  useEffect(() => { setPageLoaded(true); }, []);

  useEffect(() => {
    if (Object.keys(exercises).length > 0 && workoutStatus === 'saving') {
      setIsSaving(false);
      if (isActive) setWorkoutStatus('active');
    }
  }, [exercises, workoutStatus, isActive, setWorkoutStatus]);

  useEffect(() => {
    if (location.pathname === '/training-session') {
      updateLastActiveRoute('/training-session');
    }
  }, [location.pathname, updateLastActiveRoute]);

  useEffect(() => {
    if (pageLoaded && workoutStatus === 'idle' && hasExercises) {
      startWorkout();
    }
  }, [pageLoaded, workoutStatus, hasExercises, startWorkout]);

  useEffect(() => {
    if (location.state?.trainingConfig && !isActive) {
      setTrainingConfig(location.state.trainingConfig);
    }
    if (location.state?.fromDiscard) {
      setIsSaving(false);
    }
  }, [location.state, isActive, setTrainingConfig]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('reset') === 'true') {
      resetSession();
      toast.info("Workout session reset");
      navigate('/training-session', { replace: true });
    }
  }, [location.search, resetSession, navigate]);

  // Track saved workout ID and navigate when save is successful
  useEffect(() => {
    if (saveStatus === 'saved' && savedWorkoutId) {
      console.log('Workout saved successfully, navigating to complete page with ID:', savedWorkoutId);
      navigate(`/workout-complete/${savedWorkoutId}`);
    }
  }, [saveStatus, savedWorkoutId, navigate]);

  // Handle save errors
  useEffect(() => {
    if (saveStatus === 'failed' && savingErrors.length > 0) {
      setIsSaving(false);
      const errorMessage = savingErrors[0]?.message || 'Failed to save workout';
      toast.error("Save Error", { description: errorMessage });
    }
  }, [saveStatus, savingErrors]);

  // Exit focus mode when exercise is deleted
  useEffect(() => {
    if (focusedExercise && !exercises[focusedExercise]) {
      setFocusedExercise(null);
    }
  }, [exercises, focusedExercise, setFocusedExercise]);

  // Handle post-set flow state changes
  useEffect(() => {
    if (postSetFlow === 'rating' && lastCompletedExercise && lastCompletedSetIndex !== null) {
      setIsRatingSheetOpen(true);
      
      // Generate next set recommendation
      if (lastCompletedExercise && 
          lastCompletedSetIndex !== null && 
          storeExercises[lastCompletedExercise]?.length > lastCompletedSetIndex + 1) {
        
        const currentSet = storeExercises[lastCompletedExercise][lastCompletedSetIndex];
        const nextSetIndex = lastCompletedSetIndex + 1;
        const nextSet = storeExercises[lastCompletedExercise][nextSetIndex];
        
        // Generate motivational content
        const motivational = generateMotivationalContent(
          lastCompletedExercise, 
          currentSet,
          []
        );
        setMotivationalMessage(motivational);
        
        // Calculate volume stats
        const stats = calculateVolumeStats(
          lastCompletedExercise,
          storeExercises[lastCompletedExercise]
        );
        setVolumeStats(stats.message);
      }
    } else if (postSetFlow === 'resting') {
      setIsRatingSheetOpen(false);
      setShowEnhancedRestTimer(true);
      triggerRestTimerReset();
    } else if (postSetFlow === 'idle') {
      setIsRatingSheetOpen(false);
      setShowEnhancedRestTimer(false);
    }
  }, [postSetFlow, lastCompletedExercise, lastCompletedSetIndex, storeExercises]);

  const triggerRestTimerReset = () => setRestTimerResetSignal(x => x + 1);

  // Define the onAddSet function to add a basic set to an exercise
  const handleAddSet = (exerciseName: string) => {
    setStoreExercises(prev => ({
      ...prev,
      [exerciseName]: [...prev[exerciseName], { weight: 0, reps: 0, restTime: 60, completed: false, isEditing: false }]
    }));
  };

  const handleAddExercise = (exercise: any) => {
    const name = typeof exercise === 'string' ? exercise : exercise.name;
    if (storeExercises[name]) {
      toast({ title: "Exercise already added", description: `${name} is already in your workout` });
      return;
    }
    setStoreExercises(prev => ({ ...prev, [name]: [{ weight: 0, reps: 0, restTime: 60, completed: false, isEditing: false }] }));
    setActiveExercise(name);
    setFocusedExercise(name); // Auto-focus the newly added exercise
    if (workoutStatus === 'idle') startWorkout();
    setIsAddExerciseSheetOpen(false);
    playBell(); // Provide audio feedback for added exercise
  };

  // Enhanced rest timer helpers
  const getNextSetDetails = () => {
    if (!lastCompletedExercise || lastCompletedSetIndex === null) return null;
    
    const sets = storeExercises[lastCompletedExercise];
    if (!sets || lastCompletedSetIndex + 1 >= sets.length) return null;
    
    return sets[lastCompletedSetIndex + 1];
  };

  const handleShowRestTimer = () => { 
    setRestTimerActive(true); 
    setShowRestTimerModal(true); 
    playBell(); 
  };
  
  const handleRestTimerComplete = () => { 
    setRestTimerActive(false);
    setShowRestTimerModal(false);
    setShowEnhancedRestTimer(false);
    setPostSetFlow('idle');
    playBell(); 
  };

  const handleSubmitRating = (rating: number) => {
    submitSetRating(rating);
    playSuccess();
  };

  const handleFocusExercise = (exerciseName: string | null) => {
    if (focusedExercise === exerciseName) {
      // Toggle off if clicking the same exercise
      setFocusedExercise(null);
      playTick();
    } else {
      setFocusedExercise(exerciseName);
      setFocusedSetIndex(0); // Focus on the first set by default
      playBell();
      // Auto scroll to the focused exercise with smooth behavior
      if (exerciseName) {
        setTimeout(() => {
          const element = document.querySelector(`[data-exercise="${exerciseName}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  };

  const handleFinishWorkout = async () => {
    if (!hasExercises) {
      toast.error("Add at least one exercise before finishing your workout");
      return;
    }
    
    try {
      setIsSaving(true);
      markAsSaving();
      
      // Save the workout using the useWorkoutSave hook
      const savedId = await handleCompleteWorkout(trainingConfig);
      
      // If save failed or returned null, handle the error
      if (!savedId) {
        setIsSaving(false);
        toast.error("Failed to save workout");
        return;
      }
      
    } catch (err) {
      console.error("Error saving workout data:", err);
      setIsSaving(false);
      markAsFailed({ 
        type: 'unknown', 
        message: err instanceof Error ? err.message : 'Save failed', 
        timestamp: new Date().toISOString(), 
        recoverable: true 
      });
      toast.error("Failed to complete workout");
    }
  };

  const attemptRecovery = () => {
    console.log("Recovery attempt for workout:", workoutId);
    toast.info("Attempting to recover workout data...");
  };

  const handleNextExercise = useCallback(() => {
    if (!focusedExercise) return;
    
    // Get ordered list of exercise names
    const exerciseNames = Object.keys(exercises);
    const currentIndex = exerciseNames.indexOf(focusedExercise);
    
    // If we have a next exercise, focus on it
    if (currentIndex >= 0 && currentIndex < exerciseNames.length - 1) {
      const nextName = exerciseNames[currentIndex + 1];
      setFocusedExercise(nextName);
      
      // Auto scroll to the focused exercise with smooth behavior
      setTimeout(() => {
        const element = document.querySelector(`[data-exercise="${nextName}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      playBell();
      // Show toast with next exercise
      toast.info(`Switched to ${nextName}`);
    }
  }, [focusedExercise, exercises, setFocusedExercise, playBell]);

  const handleCompleteExercise = useCallback(() => {
    if (!focusedExercise) return;
    
    setCompletedExerciseName(focusedExercise);
    
    // Get the next exercise if available
    const exerciseNames = Object.keys(exercises);
    const currentIndex = exerciseNames.indexOf(focusedExercise);
    
    if (currentIndex >= 0 && currentIndex < exerciseNames.length - 1) {
      setNextExerciseName(exerciseNames[currentIndex + 1]);
    } else {
      setNextExerciseName(null);
    }
    
    playSuccess();
    setShowCompletionConfirmation(true);
    
  }, [focusedExercise, exercises, playSuccess]);

  // Update nextExerciseName when focused exercise changes
  useEffect(() => {
    if (focusedExercise) {
      const exerciseNames = Object.keys(exercises);
      const currentIndex = exerciseNames.indexOf(focusedExercise);
      
      if (currentIndex >= 0 && currentIndex < exerciseNames.length - 1) {
        setNextExerciseName(exerciseNames[currentIndex + 1]);
      } else {
        setNextExerciseName(null);
      }
    }
  }, [focusedExercise, exercises]);

  // Set up the adapter function to convert between the different exercise formats
  const handleSetExercises = (updatedExercises: any) => {
    if (typeof updatedExercises === 'function') {
      setStoreExercises(prev => adaptToStoreFormat(updatedExercises(adaptExerciseSets(prev))));
    } else {
      setStoreExercises(adaptToStoreFormat(updatedExercises));
    }
  };

  // Import these from setRecommendations.ts
  const generateMotivationalContent = (exerciseName: string, currentSet: any, previousSets: any[]) => {
    return `Great job on that set!`;
  };

  const calculateVolumeStats = (exerciseName: string, sets: any[]) => {
    return {
      message: `You've lifted ${sets.reduce((total, set) => 
        total + (set.completed ? (set.weight * set.reps) : 0), 0)} total kg with this exercise.`
    };
  };

  return {
    exercises,
    storeExercises,
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
    setPostSetFlow
  };
}
