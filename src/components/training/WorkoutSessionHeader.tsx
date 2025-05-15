
import React, { useEffect } from 'react';
import { WorkoutSaveStatus } from "@/components/WorkoutSaveStatus";
import { WorkoutMetrics } from "@/components/WorkoutMetrics";
import { Button } from "@/components/ui/button";
import { WorkoutStatus } from "@/types/workout";
import { cn } from '@/lib/utils';

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
  currentRestTime
}) => {
  useEffect(() => {
    // Ensure timer continuity by setting document title when component mounts
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    document.title = `Workout - ${formatTime(elapsedTime)}`;
    
    // Cleanup on unmount
    return () => {
      document.title = 'Fitness App';
    };
  }, [elapsedTime]);

  const timeLabel = elapsedTime >= 3600 
    ? `${Math.floor(elapsedTime / 3600)}h ${Math.floor((elapsedTime % 3600) / 60)}m`
    : `${Math.floor(elapsedTime / 60)}m ${elapsedTime % 60}s`;

  return (
    <>
      <div className={cn(
        // Base positioning
        "sticky top-16 z-10",
        // Visual styling with glass effect
        "bg-gray-900/90 backdrop-blur-lg",
        // Shadow for depth
        "shadow-sm",
        // Transitions
        "transition-all duration-300"
      )}>
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
        />
      </div>
      
      {workoutStatus !== 'idle' && workoutStatus !== 'active' && (
        <div className="px-4 mt-2 animate-fade-in">
          <WorkoutSaveStatus 
            status={workoutStatus}
            saveProgress={saveProgress}
            onRetry={onRetrySave}
          />
        </div>
      )}
      
      {isRecoveryMode && (
        <div className="px-4 mt-2 animate-fade-in">
          <div className={cn(
            // Visual styling
            "bg-gray-800 border border-gray-700 rounded-lg p-3",
            // Shadow for depth
            "shadow-md"
          )}>
            <h3 className="text-sm font-medium mb-1">Workout recovery available</h3>
            <p className="text-gray-400 text-xs mb-2">
              We found an unsaved workout. Continue your session or reset to start fresh.
            </p>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={onResetWorkout}
              className="w-full"
            >
              Reset & Start Fresh
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
