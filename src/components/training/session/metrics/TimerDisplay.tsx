
import React from 'react';
import { formatDuration } from '@/utils/formatTime';
import { Clock, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerDisplayProps {
  elapsedTime: number;
  restTimerActive: boolean;
  showRestTimer: boolean;
  currentRestTime: number;
  onManualRestStart: () => void;
  focusedExercise: string | null;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  elapsedTime,
  restTimerActive,
  showRestTimer,
  currentRestTime,
  onManualRestStart,
  focusedExercise
}) => {
  // Format elapsed time for display
  const formattedTime = formatDuration(elapsedTime);
  
  return (
    <div className={cn(
      "grid grid-cols-1 gap-3 w-full",
      showRestTimer ? "sm:grid-cols-2" : "sm:grid-cols-1"
    )}>
      {/* Workout Timer */}
      <div 
        className={cn(
          "rounded-xl bg-gray-900/80 backdrop-blur-md border border-white/10",
          "flex items-center justify-between p-3 shadow-md",
          "transition-all duration-300",
          restTimerActive ? "opacity-50" : "opacity-100"
        )}
      >
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-purple-400 mr-2" />
          <span className="text-sm font-medium text-gray-400">Workout Time</span>
        </div>
        <div className="text-xl font-semibold text-white">{formattedTime}</div>
      </div>

      {/* Rest Timer (Only show if active) */}
      {showRestTimer && (
        <div 
          className={cn(
            "rounded-xl backdrop-blur-md border shadow-md p-3",
            "flex items-center justify-between",
            "transition-all duration-300",
            restTimerActive 
              ? "bg-purple-900/30 border-purple-500/30 animate-pulse-slow" 
              : "bg-gray-800/80 border-white/10 cursor-pointer hover:bg-gray-700/80",
          )}
          onClick={!restTimerActive ? onManualRestStart : undefined}
        >
          <div className="flex items-center">
            <Timer className={cn(
              "h-5 w-5 mr-2",
              restTimerActive ? "text-purple-300" : "text-gray-400"
            )} />
            <span className={cn(
              "text-sm font-medium",
              restTimerActive ? "text-purple-200" : "text-gray-400"
            )}>
              Rest Timer
            </span>
          </div>
          <div className={cn(
            "text-xl font-semibold",
            restTimerActive ? "text-purple-200" : "text-white"
          )}>
            {restTimerActive ? `${currentRestTime}s` : "Tap to start"}
          </div>
        </div>
      )}
    </div>
  );
};
