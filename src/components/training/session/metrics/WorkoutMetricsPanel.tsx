
import React from 'react';
import { TimerDisplay } from './TimerDisplay';
import { WorkoutStatsDisplay } from './WorkoutStatsDisplay';
import { cn } from '@/lib/utils';
import { TrainingConfig } from '@/hooks/useTrainingSetupPersistence';

interface WorkoutMetricsPanelProps {
  elapsedTime: number;
  exerciseCount: number;
  completedSets: number;
  totalSets: number;
  isActive?: boolean;
  lastActivity?: number;
  workoutId?: string | null;
  workoutStatus?: string;
  trainingConfig?: TrainingConfig | null;
  restTimerActive?: boolean;
  currentRestTime?: number;
  onManualRestStart?: () => void;
  onRestTimerComplete?: () => void;
  onRestTimerReset?: () => void;
  restTimerResetSignal?: number;
  focusedExercise?: string | null;
  onAddExercise?: () => void;  // Added this optional prop
  className?: string;
}

export const WorkoutMetricsPanel: React.FC<WorkoutMetricsPanelProps> = ({
  elapsedTime,
  exerciseCount,
  completedSets,
  totalSets,
  restTimerActive = false,
  currentRestTime = 60,
  onManualRestStart = () => {},
  onRestTimerComplete = () => {},
  onRestTimerReset = () => {},
  restTimerResetSignal = 0,
  focusedExercise = null,
  onAddExercise,
  className
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      <TimerDisplay 
        elapsedTime={elapsedTime}
        restTimerActive={restTimerActive}
        showRestTimer={true}
        currentRestTime={currentRestTime}
        onManualRestStart={onManualRestStart}
        focusedExercise={focusedExercise}
      />
      
      <WorkoutStatsDisplay 
        exerciseCount={exerciseCount}
        completedSets={completedSets}
        totalSets={totalSets}
      />
    </div>
  );
};
