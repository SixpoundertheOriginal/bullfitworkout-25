
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { SaveAll, X, Loader2 } from "lucide-react";

interface WorkoutTerminationConfirmationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isSaving: boolean;
  onConfirmSave: () => void;
  onCancel: () => void;
  exerciseCount: number;
  completedSets: number;
}

export const WorkoutTerminationConfirmation: React.FC<WorkoutTerminationConfirmationProps> = ({
  isOpen,
  onOpenChange,
  isSaving,
  onConfirmSave,
  onCancel,
  exerciseCount,
  completedSets,
}) => {
  const canSave = exerciseCount > 0 && completedSets > 0;
  
  // Calculate statistics for better user context
  const percentageCompleted = exerciseCount > 0 
    ? Math.round((completedSets / (exerciseCount * 3)) * 100)  // Assuming 3 sets per exercise
    : 0;
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Finish workout?</AlertDialogTitle>
          <AlertDialogDescription>
            {canSave ? (
              <>
                Your workout progress will be saved. You've completed{' '}
                <span className="font-medium text-primary">{completedSets} sets</span> across{' '}
                <span className="font-medium text-primary">{exerciseCount} exercises</span>
                {percentageCompleted > 0 && (
                  <span> (approximately {percentageCompleted}% completion)</span>
                )}.
              </>
            ) : (
              <>
                <span className="text-destructive">No completed sets detected.</span> Your workout 
                cannot be saved without at least one completed exercise set.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <AlertDialogCancel onClick={onCancel} disabled={isSaving}>
            <X className="mr-2 h-4 w-4" />
            Continue workout
          </AlertDialogCancel>
          <Button
            onClick={onConfirmSave}
            disabled={isSaving || !canSave}
            className={
              canSave
                ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                : "bg-gray-500"
            }
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <SaveAll className="mr-2 h-4 w-4" />
                {canSave ? "Save & Finish" : "Cannot save"}
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
