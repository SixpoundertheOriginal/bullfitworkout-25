
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ExerciseWizard } from '@/components/exercises/ExerciseWizard';
import { Exercise } from '@/types/exercise';

interface ExerciseWizardSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectExercise: (exercise: Exercise) => void;
  trainingType?: string;
}

export function ExerciseWizardSheet({
  open,
  onOpenChange,
  onSelectExercise,
  trainingType = ""
}: ExerciseWizardSheetProps) {
  const handleExerciseCreated = (exercise: Exercise) => {
    // Pass the created exercise back to the parent component
    onSelectExercise(exercise);
    
    // We don't close the sheet immediately because we want to show the completion screen
    // The wizard's complete step has its own close button
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[90vh] rounded-t-xl border-t border-gray-700 bg-gray-900 p-0"
      >
        <div className="flex flex-col h-full">
          {/* Handle for dragging */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-12 h-1.5 bg-gray-700 rounded-full"></div>
          </div>
          
          <div className="px-4 pb-4 flex-1 overflow-hidden flex flex-col">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-xl font-bold text-center">Add New Exercise</SheetTitle>
            </SheetHeader>
            
            {/* Wizard component */}
            <ExerciseWizard
              onComplete={handleExerciseCreated}
              onCancel={() => onOpenChange(false)}
              className="flex-1"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
