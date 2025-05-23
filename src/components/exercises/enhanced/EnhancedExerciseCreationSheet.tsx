
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ExerciseCreationWizard } from './ExerciseCreationWizard';
import { Exercise } from '@/types/exercise';

interface EnhancedExerciseCreationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExerciseCreated: (exercise: Exercise) => void;
  baseExercise?: Exercise | null;
}

export function EnhancedExerciseCreationSheet({
  open,
  onOpenChange,
  onExerciseCreated,
  baseExercise = null
}: EnhancedExerciseCreationSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[90vh] rounded-t-xl border-t border-gray-700 bg-gray-900 p-0 overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Handle for dragging */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-12 h-1.5 bg-gray-700 rounded-full"></div>
          </div>
          
          <div className="px-6 pb-6 flex-1 overflow-auto">
            <SheetHeader className="mb-6 sticky top-0 pt-4 bg-gray-900 z-10">
              <SheetTitle className="text-xl font-bold text-center">
                {baseExercise ? `Create Variation of ${baseExercise.name}` : 'Create New Exercise'}
              </SheetTitle>
            </SheetHeader>
            
            {/* Wizard component */}
            <ExerciseCreationWizard
              onComplete={onExerciseCreated}
              onCancel={() => onOpenChange(false)}
              baseExercise={baseExercise}
              className="pb-20" // Add padding to ensure bottom buttons are visible when scrolled
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
