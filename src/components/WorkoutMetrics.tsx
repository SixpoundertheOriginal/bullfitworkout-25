
import React, { useState, useEffect } from "react";
import { Timer, Dumbbell, Clock, Play, Activity, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MetricCard } from "./metrics/MetricCard";
import { TopRestTimer } from "./TopRestTimer";
import { CircularProgress } from "@/components/ui/circular-progress";
import { cn } from "@/lib/utils";
import { theme } from "@/lib/theme";
import { typography } from "@/lib/typography";
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkoutMetricsProps {
  time: number;
  exerciseCount: number;
  completedSets: number;
  totalSets: number;
  showRestTimer: boolean;
  onRestTimerComplete: () => void;
  onRestTimeUpdate?: (time: number) => void;
  onManualRestStart?: () => void;
  onRestTimerReset?: () => void;
  restTimerResetSignal?: number;
  currentRestTime?: number;
  focusedExercise?: string | null;
  className?: string;
}

export const WorkoutMetrics = ({
  time,
  exerciseCount,
  completedSets,
  totalSets,
  showRestTimer,
  onRestTimerComplete,
  onRestTimeUpdate,
  onManualRestStart,
  onRestTimerReset,
  restTimerResetSignal = 0,
  currentRestTime,
  focusedExercise,
  className
}: WorkoutMetricsProps) => {
  const [resetCounter, setResetCounter] = useState(0);
  const [animateProgress, setAnimateProgress] = useState(false);
  const isMobile = useIsMobile();
  
  // Use the external reset signal
  useEffect(() => {
    if (restTimerResetSignal > 0) {
      setResetCounter(restTimerResetSignal);
    }
  }, [restTimerResetSignal]);

  useEffect(() => {
    if (showRestTimer) {
      setResetCounter(prev => prev + 1);
    }
  }, [showRestTimer]);

  // Trigger animation when completed sets changes
  useEffect(() => {
    if (completedSets > 0) {
      setAnimateProgress(true);
      const timeout = setTimeout(() => setAnimateProgress(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [completedSets]);

  const startTime = new Date();
  startTime.setSeconds(startTime.getSeconds() - time);
  const formattedStartTime = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const completionPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  const efficiency = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  // Responsive grid layout based on device and focus state
  const gridLayout = isMobile 
    ? focusedExercise 
      ? "grid-cols-2" 
      : "grid-cols-2"
    : "grid-cols-4";

  return (
    <div className={cn("relative w-full", className)}>
      {/* Background glow effects - subtler for mobile */}
      <div className="absolute -top-10 -left-20 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl opacity-50 sm:opacity-80" />
      <div className="absolute -top-10 -right-20 w-60 h-60 bg-pink-600/10 rounded-full blur-3xl opacity-50 sm:opacity-80" />
      
      <div className={cn(
        "grid gap-2 p-2 sm:p-3 rounded-xl",
        gridLayout, 
        "bg-gradient-to-br from-gray-900/90 to-gray-800/60 backdrop-blur-md",
        "border border-white/5 shadow-lg",
        "transition-all duration-300",
        focusedExercise ? "border-purple-500/20 shadow-purple-500/10" : ""
      )}>
        {/* Time Card */}
        <MetricCard
          icon={Clock}
          value={formatTime(time)}
          label="Time"
          tooltip={`Tracked since ${formattedStartTime}`}
          gradientClass="from-blue-600/20 via-black/5 to-blue-900/20 hover:from-blue-600/30 hover:to-blue-900/30"
          valueClass="text-blue-300 font-semibold bg-gradient-to-br from-blue-200 to-blue-400 bg-clip-text text-transparent text-sm sm:text-base"
          labelClass={cn(typography.sections.label, "text-xs")}
          className="p-2 hover:scale-105 transition-transform duration-200 active:scale-95 touch-feedback"
        />

        {/* Exercise Count Card */}
        <MetricCard
          icon={Dumbbell}
          value={exerciseCount}
          label="Exercises"
          tooltip="Active exercises in your workout"
          gradientClass="from-emerald-600/20 via-black/5 to-emerald-900/20 hover:from-emerald-600/30 hover:to-emerald-900/30"
          valueClass="text-emerald-300 font-semibold bg-gradient-to-br from-emerald-200 to-emerald-400 bg-clip-text text-transparent text-sm sm:text-base"
          labelClass={cn(typography.sections.label, "text-xs")}
          className="p-2 hover:scale-105 transition-transform duration-200 active:scale-95 touch-feedback"
        />

        {/* Sets Card */}
        <MetricCard
          icon={Activity}
          value={`${completedSets}/${totalSets}`}
          label="Sets"
          tooltip={`${efficiency}% sets completed`}
          progressValue={completionPercentage}
          gradientClass={cn(
            "from-purple-600/20 via-black/5 to-purple-900/20 hover:from-purple-600/30 hover:to-purple-900/30",
            animateProgress && "from-purple-600/40 to-purple-900/40"
          )}
          valueClass={cn(
            "text-purple-300 font-semibold bg-gradient-to-br from-purple-200 to-purple-400 bg-clip-text text-transparent text-sm sm:text-base",
            animateProgress && "scale-110 transition-transform"
          )}
          labelClass={cn(typography.sections.label, "text-xs")}
          className={cn(
            "p-2 transition-all duration-300",
            animateProgress && "shadow-md shadow-purple-500/20",
            "hover:scale-105 active:scale-95 touch-feedback"
          )}
        />

        {/* Rest Timer Card */}
        <div className={cn(
          "relative flex flex-col items-center justify-center p-2 rounded-xl border backdrop-blur-xl transition-all duration-300",
          "bg-gradient-to-br from-gray-900/90 via-gray-800/50 to-gray-900/90",
          showRestTimer 
            ? "border-orange-500/30 from-orange-600/30 to-orange-900/30 shadow-lg shadow-orange-500/20 scale-[1.02]" 
            : "border-white/10 hover:from-orange-600/20 hover:to-orange-900/20 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/10",
          "relative overflow-hidden touch-feedback"
        )}>
          {showRestTimer && (
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent animate-pulse"></div>
          )}
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-1 rounded-full bg-white/8 shadow-inner flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center">
              <CircularProgress
                value={showRestTimer ? 100 : 0}
                size={28}
                className="text-orange-500/30"
              >
                <Timer
                  size={14}
                  className={cn(
                    "text-orange-300 absolute inset-0 m-auto",
                    showRestTimer && "animate-pulse"
                  )}
                />
              </CircularProgress>
            </div>
            <TopRestTimer
              isActive={showRestTimer}
              onComplete={onRestTimerComplete}
              resetSignal={resetCounter}
              onTimeUpdate={onRestTimeUpdate}
              onManualStart={onManualRestStart}
              currentRestTime={currentRestTime}
              className="scale-90"
            />

            {!showRestTimer && onManualRestStart && (
              <Button
                variant="outline"
                size="sm"
                onClick={onManualRestStart}
                className={cn(
                  "mt-1 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/30",
                  "hover:bg-orange-500/30 text-orange-300 transition-all duration-300 shadow-sm",
                  "hover:shadow-md hover:shadow-orange-500/10 active:scale-95",
                  "h-7 px-2 py-0 text-xs font-medium"
                )}
              >
                <Play size={10} className="mr-1" /> Start
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
