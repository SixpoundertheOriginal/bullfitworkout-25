
import React from 'react';
import { TimerDisplay } from './TimerDisplay';
import { WorkoutStatsDisplay } from './WorkoutStatsDisplay';
import { cn } from '@/lib/utils';

interface WorkoutMetricsPanelProps {
  elapsedTime: number;
  exerciseCount: number;
  completedSets: number;
  totalSets: number;
  restTimerActive: boolean;
  currentRestTime: number;
  onManualRestStart: () => void;
  onRestTimerComplete: () => void;
  onRestTimerReset: () => void;
  restTimerResetSignal: number;
  focusedExercise: string | null;
  className?: string;
}

export const WorkoutMetricsPanel: React.FC<WorkoutMetricsPanelProps> = ({
  elapsedTime,
  exerciseCount,
  completedSets,
  totalSets,
  restTimerActive,
  currentRestTime,
  onManualRestStart,
  onRestTimerComplete,
  onRestTimerReset,
  restTimerResetSignal,
  focusedExercise,
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
