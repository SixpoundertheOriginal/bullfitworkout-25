
import React, { useEffect } from 'react';
import { WorkoutSaveStatus } from "@/components/WorkoutSaveStatus";
import { WorkoutMetrics } from "@/components/WorkoutMetrics";
import { Button } from "@/components/ui/button";
import { WorkoutStatus } from "@/types/workout";
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Dumbbell, Target, Award } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkoutSessionHeaderProps {
  elapsedTime: number;
  exerciseCount: number;
  completedSets: number;
  totalSets: number;
  workoutStatus: WorkoutStatus;
  isRecoveryMode: boolean;
  saveProgress: any;
  onRetrySave: () => void;
  onResetWorkout: () => void;
  restTimerActive: boolean;
  onRestTimerComplete: () => void;
  onShowRestTimer: () => void;
  onRestTimerReset: () => void;
  restTimerResetSignal: number;
  currentRestTime: number;
  focusedExercise?: string | null;
}

export const WorkoutSessionHeader: React.FC<WorkoutSessionHeaderProps> = ({
  elapsedTime,
  exerciseCount,
  completedSets,
  totalSets,
  workoutStatus,
  isRecoveryMode,
  saveProgress,
  onRetrySave,
  onResetWorkout,
  restTimerActive,
  onRestTimerComplete,
  onShowRestTimer,
  onRestTimerReset,
  restTimerResetSignal,
  currentRestTime,
  focusedExercise
}) => {
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Ensure timer continuity by setting document title when component mounts
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    const title = focusedExercise 
      ? `${focusedExercise} - ${formatTime(elapsedTime)}`
      : `Workout - ${formatTime(elapsedTime)}`;
    
    document.title = title;
    
    // Cleanup on unmount
    return () => {
      document.title = 'Fitness App';
    };
  }, [elapsedTime, focusedExercise]);

  const formattedElapsedTime = elapsedTime >= 3600 
    ? `${Math.floor(elapsedTime / 3600)}h ${Math.floor((elapsedTime % 3600) / 60)}m`
    : `${Math.floor(elapsedTime / 60)}m ${elapsedTime % 60}s`;

  return (
    <div className="space-y-2">
      {/* Session header with title and workout metrics */}
      <div className={cn(
        // Base positioning
        "sticky top-16 z-10",
        // Visual styling with glass effect
        "bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-lg",
        // Shadow for depth
        "shadow-sm shadow-purple-500/10 border-b border-white/5",
        // Transitions
        "transition-all duration-300",
        // Focused state styling
        focusedExercise ? "pb-1" : "",
        // Reduce padding on mobile
        isMobile ? "pt-1.5 pb-1" : "pt-2.5 pb-1.5"
      )}>
        <div className="container max-w-5xl mx-auto px-3 sm:px-4">
          {/* Workout type header with progress indicator */}
          <div className="flex items-center mb-1.5">
            {focusedExercise ? (
              <>
                <Target className="h-5 w-5 text-purple-400 mr-2" />
                <h1 className="text-lg font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-purple-400">
                  {focusedExercise}
                </h1>
              </>
            ) : (
              <>
                <Dumbbell className="h-5 w-5 text-purple-400 mr-2" />
                <h1 className="text-lg font-bold text-white">Active Workout</h1>
              </>
            )}
            
            <div className="ml-auto flex items-center space-x-3">
              {completedSets > 0 && (
                <div className="flex items-center text-sm">
                  <Award className="h-4 w-4 text-purple-400 mr-1" />
                  <span className="text-purple-200">{completedSets}/{totalSets} sets</span>
                </div>
              )}
              <div className="hidden sm:block text-sm text-gray-400">
                Session time: <span className="text-white">{formattedElapsedTime}</span>
              </div>
            </div>
          </div>
          
          {/* Metrics panel */}
          <WorkoutMetrics
            time={elapsedTime}
            exerciseCount={exerciseCount}
            completedSets={completedSets}
            totalSets={totalSets}
            showRestTimer={restTimerActive}
            onRestTimerComplete={onRestTimerComplete}
            onManualRestStart={onShowRestTimer}
            onRestTimerReset={onRestTimerReset}
            restTimerResetSignal={restTimerResetSignal}
            currentRestTime={currentRestTime}
            focusedExercise={focusedExercise}
          />
        </div>
      </div>
      
      {/* Status notifications */}
      {(workoutStatus !== 'idle' && workoutStatus !== 'active') || isRecoveryMode ? (
        <div className="container max-w-5xl mx-auto px-3 sm:px-4">
          {workoutStatus !== 'idle' && workoutStatus !== 'active' && (
            <div className="animate-fade-in">
              <WorkoutSaveStatus 
                status={workoutStatus}
                saveProgress={saveProgress}
                onRetry={onRetrySave}
              />
            </div>
          )}
          
          {isRecoveryMode && (
            <div className="animate-fade-in">
              <Card className="overflow-hidden border-amber-800/30 bg-amber-950/20">
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium mb-1 text-amber-300">Workout recovery available</h3>
                  <p className="text-amber-200/70 text-xs mb-2">
                    We found an unsaved workout. Continue your session or reset to start fresh.
                  </p>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={onResetWorkout}
                    className="w-full bg-amber-700 hover:bg-amber-600"
                  >
                    Reset & Start Fresh
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
