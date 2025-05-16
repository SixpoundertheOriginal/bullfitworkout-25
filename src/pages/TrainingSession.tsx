import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useWorkoutStore } from '@/store/workoutStore';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';
import { useExercises } from "@/hooks/useExercises";
import { WorkoutSessionHeader } from "@/components/training/WorkoutSessionHeader";
import { ExerciseList } from "@/components/training/ExerciseList";
import { AddExerciseSheet } from "@/components/training/AddExerciseSheet";
import { Loader2, Dumbbell } from "lucide-react";
import { Exercise } from "@/types/exercise";
import { useSound } from "@/hooks/useSound";
import { RestTimer } from "@/components/RestTimer";
import { EnhancedRestTimer } from "@/components/training/EnhancedRestTimer";
import { PostSetRatingSheet } from "@/components/training/PostSetRatingSheet";
import { WorkoutSessionFooter } from "@/components/training/WorkoutSessionFooter";
import { adaptExerciseSets, adaptToStoreFormat } from "@/utils/exerciseAdapter";
import { useWorkoutSave } from "@/hooks/useWorkoutSave";
import { calculateVolumeStats, generateMotivationalContent, getNextSetRecommendation } from "@/utils/setRecommendations";

const TrainingSessionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { exercises: allExercises, isLoading: loadingExercises } = useExercises();
  
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

  useWorkoutTimer();
  const { play: playBell } = useSound('/sounds/bell.mp3');
  const { play: playTick } = useSound('/sounds/tick.mp3');
  const { play: playSuccess } = useSound('/sounds/success.mp3');
  
  const [isAddExerciseSheetOpen, setIsAddExerciseSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showRestTimerModal, setShowRestTimerModal] = useState(false);
  const [showEnhancedRestTimer, setShowEnhancedRestTimer] = useState(false);
  const [restTimerResetSignal, setRestTimerResetSignal] = useState(0);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [nextSetRecommendation, setNextSetRecommendation] = useState(null);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [volumeStats, setVolumeStats] = useState('');

  const exerciseCount = Object.keys(exercises).length;
  const hasExercises = exerciseCount > 0;
  
  // State for post-set rating
  const [isRatingSheetOpen, setIsRatingSheetOpen] = useState(false);
  
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

  const handleAddExercise = (exercise: Exercise | string) => {
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

  if (loadingExercises) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="flex flex-col items-center">
          <div className="mb-4 relative">
            <div className="w-16 h-16 rounded-full bg-purple-900/20 flex items-center justify-center">
              <Dumbbell className="w-8 h-8 text-purple-400 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            </div>
          </div>
          <p className="text-gray-400">Loading your workout...</p>
        </div>
      </div>
    );
  }

  // Set up the adapter function to convert between the different exercise formats
  const handleSetExercises = (updatedExercises) => {
    if (typeof updatedExercises === 'function') {
      setStoreExercises(prev => adaptToStoreFormat(updatedExercises(adaptExerciseSets(prev))));
    } else {
      setStoreExercises(adaptToStoreFormat(updatedExercises));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white pt-16 pb-16">
      <main className="flex-1 overflow-auto">
        <div className="mx-auto py-6 pb-40">
          <div className="relative">
            <WorkoutSessionHeader
              elapsedTime={elapsedTime}
              exerciseCount={exerciseCount}
              completedSets={completedSets}
              totalSets={totalSets}
              workoutStatus={workoutStatus}
              isRecoveryMode={!!workoutId}
              saveProgress={0}
              onRetrySave={() => workoutId && attemptRecovery()}
              onResetWorkout={resetSession}
              restTimerActive={restTimerActive}
              onRestTimerComplete={handleRestTimerComplete}
              onShowRestTimer={handleShowRestTimer}
              onRestTimerReset={triggerRestTimerReset}
              restTimerResetSignal={restTimerResetSignal}
              currentRestTime={currentRestTime}
              focusedExercise={focusedExercise}
            />
            
            {/* Standard rest timer (when manually triggered) */}
            {showRestTimerModal && !showEnhancedRestTimer && (
              <div className="fixed right-4 top-32 z-50 w-72">
                <RestTimer
                  isVisible={showRestTimerModal}
                  onClose={() => { setShowRestTimerModal(false); setRestTimerActive(false); }}
                  onComplete={handleRestTimerComplete}
                  maxTime={currentRestTime || 60}
                />
              </div>
            )}
            
            {/* Enhanced rest timer (shown after rating a set) */}
            {showEnhancedRestTimer && (
              <div className="fixed right-4 top-32 z-50 w-72">
                <EnhancedRestTimer
                  isVisible={showEnhancedRestTimer}
                  onClose={() => { 
                    setShowEnhancedRestTimer(false); 
                    setRestTimerActive(false);
                    setPostSetFlow('idle');
                  }}
                  onComplete={handleRestTimerComplete}
                  maxTime={currentRestTime || 60}
                  exerciseName={lastCompletedExercise || undefined}
                  nextSet={getNextSetDetails()}
                  recommendation={nextSetRecommendation}
                  motivationalMessage={motivationalMessage}
                  volumeStats={volumeStats}
                />
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <ExerciseList
              exercises={exercises}
              activeExercise={activeExercise}
              focusedExercise={focusedExercise}
              onAddSet={handleAddSet}
              onCompleteSet={handleCompleteSet}
              onDeleteExercise={deleteExercise}
              onRemoveSet={(name, i) => {
                setStoreExercises(prev => ({ ...prev, [name]: prev[name].filter((_, idx) => idx !== i) }));
              }}
              onEditSet={(name, i) => {
                setStoreExercises(prev => ({ ...prev, [name]: prev[name].map((s, idx) => idx === i ? { ...s, isEditing: true } : s) }));
              }}
              onSaveSet={(name, i) => {
                setStoreExercises(prev => ({ ...prev, [name]: prev[name].map((s, idx) => idx === i ? { ...s, isEditing: false } : s) }));
              }}
              onWeightChange={(name, i, v) => {
                setStoreExercises(prev => ({ ...prev, [name]: prev[name].map((s, idx) => idx === i ? { ...s, weight: +v || 0 } : s) }));
              }}
              onRepsChange={(name, i, v) => {
                setStoreExercises(prev => ({ ...prev, [name]: prev[name].map((s, idx) => idx === i ? { ...s, reps: parseInt(v) || 0 } : s) }));
              }}
              onRestTimeChange={(name, i, v) => {
                setStoreExercises(prev => ({ ...prev, [name]: prev[name].map((s, idx) => idx === i ? { ...s, restTime: parseInt(v) || 60 } : s) }));
              }}
              onWeightIncrement={(name, i, inc) => {
                setStoreExercises(prev => {
                  const set = prev[name][i];
                  return { ...prev, [name]: prev[name].map((s, idx) => idx === i ? { ...s, weight: Math.max(0, (set.weight || 0) + inc) } : s) };
                });
              }}
              onRepsIncrement={(name, i, inc) => {
                setStoreExercises(prev => {
                  const set = prev[name][i];
                  return { ...prev, [name]: prev[name].map((s, idx) => idx === i ? { ...s, reps: Math.max(0, (set.reps || 0) + inc) } : s) };
                });
              }}
              onRestTimeIncrement={(name, i, inc) => {
                setStoreExercises(prev => {
                  const set = prev[name][i];
                  return { ...prev, [name]: prev[name].map((s, idx) => idx === i ? { ...s, restTime: Math.max(0, (set.restTime || 60) + inc) } : s) };
                });
              }}
              onShowRestTimer={handleShowRestTimer}
              onResetRestTimer={triggerRestTimerReset}
              onFocusExercise={handleFocusExercise}
              onOpenAddExercise={() => setIsAddExerciseSheetOpen(true)}
              setExercises={handleSetExercises}
            />
          </div>
        </div>
      </main>

      {/* Bottom drawer for Add & Finish */}
      <WorkoutSessionFooter
        onAddExercise={() => setIsAddExerciseSheetOpen(true)}
        onFinishWorkout={handleFinishWorkout}
        hasExercises={hasExercises}
        isSaving={isSaving || saveStatus === 'saving'}
        focusedExercise={focusedExercise}
        onExitFocus={() => setFocusedExercise(null)}
      />

      {/* Sheets */}
      <AddExerciseSheet
        open={isAddExerciseSheetOpen}
        onOpenChange={setIsAddExerciseSheetOpen}
        onSelectExercise={handleAddExercise}
        trainingType={trainingConfig?.trainingType}
      />
      
      <PostSetRatingSheet
        open={isRatingSheetOpen}
        onOpenChange={(open) => {
          setIsRatingSheetOpen(open);
          if (!open) setPostSetFlow('idle');
        }}
        onSubmitRating={handleSubmitRating}
        exerciseName={lastCompletedExercise || ''}
        setDetails={lastCompletedExercise && lastCompletedSetIndex !== null && storeExercises[lastCompletedExercise]
          ? storeExercises[lastCompletedExercise][lastCompletedSetIndex]
          : undefined}
      />
    </div>
  );
};

export default TrainingSessionPage;
