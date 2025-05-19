
import React from 'react';
import { Target, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkoutStatus } from '@/types/workout';
import { WorkoutSaveStatus } from "@/components/WorkoutSaveStatus";
import { Card, CardContent } from '@/components/ui/card';

interface TrainingSessionLayoutProps {
  children: React.ReactNode;
  focusedExercise: string | null;
  elapsedTime: number;
  completedSets: number;
  totalSets: number;
  workoutStatus: WorkoutStatus;
  isRecoveryMode: boolean;
  saveProgress: any; // Changed from number to any to avoid type issues
  onRetrySave: () => void;
  headerContent?: React.ReactNode;
  metricsPanel?: React.ReactNode;
  className?: string;
}

export const TrainingSessionLayout: React.FC<TrainingSessionLayoutProps> = ({
  children,
  focusedExercise,
  elapsedTime,
  completedSets,
  totalSets,
  workoutStatus,
  isRecoveryMode,
  saveProgress,
  onRetrySave,
  headerContent,
  metricsPanel,
  className
}) => {
  // Format elapsed time as MM:SS for the document title
  const formatTimeForTitle = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Update document title when component mounts/updates
  React.useEffect(() => {
    const title = focusedExercise 
      ? `${focusedExercise} - ${formatTimeForTitle(elapsedTime)}`
      : `Workout - ${formatTimeForTitle(elapsedTime)}`;
    
    document.title = title;
    
    // Cleanup on unmount
    return () => {
      document.title = 'Fitness App';
    };
  }, [elapsedTime, focusedExercise]);

  return (
    <div className={cn(
      "flex flex-col min-h-screen bg-black text-white pt-16 pb-4",
      className
    )}>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto pb-4">
          <div className="relative">
            {/* Header with Exercise Focus or Workout Title */}
            <div className={cn(
              "sticky top-16 z-10",
              "bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-lg",
              "shadow-sm shadow-purple-500/10 border-b border-white/5",
              "transition-all duration-300",
              "py-2.5"
            )}>
              <div className="container max-w-5xl mx-auto px-3 sm:px-4">
                <div className="flex items-center mb-2">
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
                      <div className="text-sm">
                        <span className="text-purple-200">{completedSets}/{totalSets} sets</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Metrics Panel */}
                {metricsPanel}
                
                {/* Extra Header Content */}
                {headerContent}
              </div>
            </div>
            
            {/* Status notifications */}
            {(workoutStatus !== 'idle' && workoutStatus !== 'active') || isRecoveryMode ? (
              <div className="container max-w-5xl mx-auto px-3 sm:px-4 mt-2">
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
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ) : null}
          </div>
          
          {/* Main content */}
          <div className="mt-3 px-3 sm:px-4">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
