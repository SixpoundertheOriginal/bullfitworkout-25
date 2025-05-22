
import React, { useState } from 'react';
import { TrainingSessionLayout } from './session/layout/TrainingSessionLayout';
import { ExerciseListWrapper } from './session/ExerciseListWrapper';
import { WorkoutMetricsPanel } from './session/metrics/WorkoutMetricsPanel';
import { EmptyWorkoutState } from './session/EmptyWorkoutState';
import { TrainingSessionSheets } from './session/TrainingSessionSheets';
import { WorkoutCompletion } from './WorkoutCompletion';
import { useTrainingSession } from '@/hooks/training-session';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useWorkoutStore } from '@/store/workout';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

export const SimplifiedTrainingContent: React.FC = () => {
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionInitiated, setCompletionInitiated] = useState(false);
  
  // Get all the training session data and functions
  const {
    exercises,
    elapsedTime,
    hasExercises,
    exerciseCount,
    completedSets,
    totalSets,
    workoutStatus,
    workoutId,
    activeExercise,
    focusedExercise,
    nextExerciseName,
    isAddExerciseSheetOpen,
    setIsAddExerciseSheetOpen,
    isRatingSheetOpen,
    setIsRatingSheetOpen,
    postSetFlow,
    trainingConfig,
    lastCompletedExercise,
    lastCompletedSetIndex,
    handleAddExercise,
    handleFinishWorkout,
    isSaving,
    handleSubmitRating,
  } = useTrainingSession();
  
  // Get store state
  const { isActive } = useWorkoutStore();
  
  // Handle opening the add exercise sheet
  const handleOpenAddExerciseSheet = () => {
    console.log('SimplifiedTrainingContent: Opening add exercise sheet');
    setIsAddExerciseSheetOpen(true);
  };
  
  // Handle workout finish
  const handleFinishWorkoutClick = async () => {
    try {
      if (!hasExercises || Object.keys(exercises).length === 0) {
        return;
      }
      
      setCompletionInitiated(true);
      setShowCompletion(true);
      
    } catch (error) {
      console.error("Error while finishing workout:", error);
    }
  };
  
  // Detect potential issues with workoutId
  const hasWorkoutIdIssue = isActive && !workoutId;
  
  // If showing completion view
  if (showCompletion) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white pt-16 pb-4">
        <main className="flex-1 overflow-auto px-4">
          <div className="container max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold my-6 text-center">Workout Complete</h1>
            
            <WorkoutCompletion
              exercises={exercises}
              duration={elapsedTime}
              intensity={7}
              efficiency={8}
              onComplete={() => {
                handleFinishWorkout()
                  .then(() => {
                    setShowCompletion(false);
                    setCompletionInitiated(false);
                    toast.success("Workout completed successfully!");
                  })
                  .catch((error) => {
                    console.error("Error saving workout:", error);
                    toast.error("Error saving workout.");
                  });
              }}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <TrainingSessionLayout>
      <WorkoutMetricsPanel 
        elapsedTime={elapsedTime}
        exerciseCount={exerciseCount}
        completedSets={completedSets}
        totalSets={totalSets}
      />
      
      {/* Show warning badge for missing workout ID */}
      {hasWorkoutIdIssue && process.env.NODE_ENV !== 'production' && (
        <div className="mx-4 mb-2">
          <Badge variant="destructive" className="flex items-center gap-1 py-1 px-2 w-full justify-center">
            <AlertTriangle size={14} />
            <span className="text-xs">Missing Workout ID - Save Issues Likely</span>
          </Badge>
        </div>
      )}
      
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto pb-24">
        {hasExercises ? (
          <ExerciseListWrapper 
            adaptedExercises={exercises}
            safeActiveExercise={activeExercise}
            safeFocusedExercise={focusedExercise}
            nextExerciseName={nextExerciseName || ""}
            exerciseCount={exerciseCount}
            isComplete={false}
            totalSets={totalSets}
            completedSets={completedSets}
            onFinishWorkout={handleFinishWorkoutClick}
            isSaving={isSaving}
            onOpenAddExercise={handleOpenAddExerciseSheet}
          />
        ) : (
          <EmptyWorkoutState 
            onAddExerciseClick={handleOpenAddExerciseSheet}
          />
        )}
      </div>
      
      {/* Unified action button - fixed at bottom */}
      <AnimatePresence>
        {hasExercises && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed bottom-20 left-0 right-0 px-4 z-50"
          >
            <div className="container max-w-md mx-auto">
              <Card className={cn(
                "p-4 flex flex-row justify-between items-center",
                "bg-gradient-to-br from-gray-900/95 to-black/95",
                "border border-gray-800/50",
                "shadow-lg shadow-purple-900/10"
              )}>
                <Button
                  onClick={handleOpenAddExerciseSheet}
                  variant="outline"
                  size="sm"
                  className="bg-indigo-900/30 border-indigo-700/30 hover:bg-indigo-800/30"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Exercise
                </Button>
                
                <Button
                  onClick={handleFinishWorkoutClick}
                  disabled={completedSets === 0 || isSaving}
                  size="sm"
                  className={`
                    ${completedSets === 0 ? 'bg-gray-700 text-gray-300' : 'bg-gradient-to-r from-green-600 to-emerald-700'} 
                    transition-all duration-300
                  `}
                >
                  {isSaving ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    'Complete Workout'
                  )}
                </Button>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sheets for adding exercises, rating, etc. */}
      <TrainingSessionSheets
        isAddExerciseSheetOpen={isAddExerciseSheetOpen}
        setIsAddExerciseSheetOpen={setIsAddExerciseSheetOpen}
        isRatingSheetOpen={isRatingSheetOpen}
        setIsRatingSheetOpen={setIsRatingSheetOpen}
        handleSubmitRating={handleSubmitRating}
        trainingConfig={trainingConfig}
        lastCompletedExercise={lastCompletedExercise}
        lastCompletedSetIndex={lastCompletedSetIndex}
        handleAddExercise={handleAddExercise}
      />
      
      {/* Only show in development mode */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-2 right-2 z-50 opacity-50 hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs bg-gray-900/80 text-gray-400"
            onClick={() => {
              const state = JSON.stringify({
                exercises: Object.keys(exercises),
                sets: completedSets,
                isActive,
                workoutId
              });
              console.log('Training Session Debug:', state);
              navigator.clipboard.writeText(state);
              toast.success('Debug state copied to clipboard');
            }}
          >
            Debug
          </Button>
        </div>
      )}
    </TrainingSessionLayout>
  );
};
