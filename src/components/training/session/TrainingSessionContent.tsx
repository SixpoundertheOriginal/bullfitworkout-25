
import React, { useEffect } from 'react';
import { TrainingSessionLayout } from './layout/TrainingSessionLayout';
import { ExerciseListWrapper } from './ExerciseListWrapper';
import { TrainingSessionSheets } from './TrainingSessionSheets';
import { TrainingActionButtons } from './actions/TrainingActionButtons';
import { WorkoutMetricsPanel } from './metrics/WorkoutMetricsPanel';
import { EmptyWorkoutState } from './EmptyWorkoutState';
import { FloatingAddExerciseButton } from '../FloatingAddExerciseButton';
import { SetsDebugger } from '../SetsDebugger';
import { EmergencyWorkoutReset } from '../EmergencyWorkoutReset';
import { useTrainingSessionState } from '@/hooks/training-session/useTrainingSessionState';
import { useWorkoutStore } from '@/store/workout';
import { useTrainingSessionData } from '@/hooks/training-session/useTrainingSessionData';
import { submitSetRating } from '@/store/workout/actions';
import { useAddExercise } from '@/store/workout/hooks';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface TrainingSessionContentProps {
  onFinishWorkoutClick: () => void;
  isSaving?: boolean;
  onOpenAddExercise?: () => void;
}

export const TrainingSessionContent: React.FC<TrainingSessionContentProps> = ({
  onFinishWorkoutClick,
  isSaving = false,
  onOpenAddExercise,
}) => {
  const {
    exercises,
    setIsAddExerciseSheetOpen,
    isAddExerciseSheetOpen,
    isRatingSheetOpen,
    setIsRatingSheetOpen,
    trainingConfig,
    postSetFlow,
    lastCompletedExercise,
    lastCompletedSetIndex,
    elapsedTime,
    activeExercise,
    focusedExercise
  } = useTrainingSessionState();
  
  // Use the hook to get computed data from exercises
  const {
    hasExercises,
    exerciseCount,
    totalSets,
    completedSets,
    nextExerciseName
  } = useTrainingSessionData(exercises, focusedExercise);

  // Get additional workout state info to determine if we should show empty state
  const { isActive, workoutId } = useWorkoutStore();

  // Get the addExercise function from the hook
  const { addExercise } = useAddExercise();

  // Need to convert exercises to adaptedExercises
  const adaptedExercises = React.useMemo(() => {
    return exercises;
  }, [exercises]);
  
  // Show warning if workout is active but has no workoutId (only in development)
  useEffect(() => {
    if (isActive && !workoutId) {
      console.error("⚠️ Active workout session detected without a valid workoutId");
      toast({
        title: "Workout ID Missing",
        description: "This workout has no ID. This may cause issues with saving.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [isActive, workoutId]);
  
  const handleOpenAddExerciseSheet = () => {
    console.log('TrainingSessionContent: Opening add exercise sheet');
    setIsAddExerciseSheetOpen(true);
  };

  // Handler for adding an exercise after selection
  const handleAddExercise = (exerciseName: string) => {
    console.log('TrainingSessionContent: Adding exercise', exerciseName);
    // Use the hook's addExercise function
    addExercise(exerciseName);
    
    // Close the sheet afterward
    setIsAddExerciseSheetOpen(false);
  };

  // Handler for when the rating is submitted
  const handleSubmitRating = (rpe: number) => {
    console.log('Submitting RPE rating:', rpe);
    submitSetRating(rpe);
    
    setIsRatingSheetOpen(false);
  };
  
  // Detect potential issues with workoutId
  const hasWorkoutIdIssue = isActive && !workoutId;
  
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
      
      {hasExercises ? (
        <ExerciseListWrapper 
          adaptedExercises={adaptedExercises}
          safeActiveExercise={activeExercise}
          safeFocusedExercise={focusedExercise}
          nextExerciseName={nextExerciseName || ""}
          exerciseCount={exerciseCount}
          isComplete={false}
          totalSets={totalSets}
          completedSets={completedSets}
          onFinishWorkout={onFinishWorkoutClick}
          isSaving={isSaving}
          onOpenAddExercise={onOpenAddExercise || handleOpenAddExerciseSheet}
        />
      ) : (
        <EmptyWorkoutState 
          onAddExerciseClick={handleOpenAddExerciseSheet}
        />
      )}

      <TrainingActionButtons 
        onFinishWorkout={onFinishWorkoutClick}
        isSubmitting={isSaving}
        exerciseCount={exerciseCount}
        completedSets={completedSets}
      />
      
      <FloatingAddExerciseButton
        onClick={onOpenAddExercise || handleOpenAddExerciseSheet}
        className="z-[90]" // Increased z-index to ensure visibility
      />

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
      
      {/* Only visible in dev environment */}
      <SetsDebugger />

      {/* Added EmergencyWorkoutReset to the main session for easy access */}
      <EmergencyWorkoutReset />
    </TrainingSessionLayout>
  );
};
