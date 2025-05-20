
import React from 'react';
import { WorkoutStatus } from '@/store/workout/types';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { WorkoutSaveStatus } from '@/components/WorkoutSaveStatus';

interface TrainingSessionLayoutProps {
  children: React.ReactNode;
  focusedExercise: string | null;
  elapsedTime: number;
  completedSets: number;
  totalSets: number;
  workoutStatus: WorkoutStatus;
  isRecoveryMode: boolean;
  saveProgress: number;
  onRetrySave: () => void;
  onAddExercise?: () => void;
  metricsPanel?: React.ReactNode;
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
  onAddExercise,
  metricsPanel,
}) => {
  const hasExercises = totalSets > 0;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white pt-16">
      {/* Top save status indicator */}
      <WorkoutSaveStatus 
        status={workoutStatus} 
        saveProgress={saveProgress}  // Changed from progress to saveProgress
        onRetry={onRetrySave} 
      />
      
      <main className="flex-1 overflow-auto px-4 pt-2 pb-24">
        <div className="container mx-auto max-w-5xl">
          {/* Metrics section */}
          {metricsPanel}
          
          {/* Content with optional empty state */}
          {hasExercises ? (
            // Normal content when exercises exist
            <div className="pb-32 mt-4">
              {children}
            </div>
          ) : (
            // Empty state with add button
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center mt-10">
              <div className="rounded-xl bg-gray-800/50 border border-gray-700/50 p-8 max-w-md mx-auto w-full">
                <h2 className="text-2xl font-bold mb-2">Add Your First Exercise</h2>
                <p className="text-gray-400 mb-6">
                  Start by adding an exercise to your workout session.
                </p>
                
                {onAddExercise && (
                  <Button
                    onClick={onAddExercise}
                    size="lg"
                    className={cn(
                      "w-full transition-all duration-300",
                      "bg-gradient-to-r from-purple-600 to-indigo-600",
                      "hover:from-purple-700 hover:to-indigo-700",
                      "text-white shadow-lg"
                    )}
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Add Exercise
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
