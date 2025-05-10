
import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MovementPattern, Difficulty } from "@/constants/exerciseMetadata";
import { useExerciseFormState, ExerciseFormState } from "@/hooks/useExerciseFormState";
import { ExerciseDialogBasic } from "@/components/exercises/ExerciseDialog/ExerciseDialogBasic";
import { ExerciseDialogAdvanced } from "@/components/exercises/ExerciseDialog/ExerciseDialogAdvanced";
import { ExerciseDialogMetrics } from "@/components/exercises/ExerciseDialog/ExerciseDialogMetrics";
import { ExerciseDialogInstructions } from "@/components/exercises/ExerciseDialog/ExerciseDialogInstructions";

interface ExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  onSubmit: (exercise: {
    name: string;
    description: string;
    movement_pattern: MovementPattern;
    difficulty: Difficulty;
    instructions: { steps: string; form: string };
    is_compound: boolean;
    is_bodyweight: boolean;
    tips: string[];
    variations: string[];
    loading_type?: string;
    estimated_load_percent?: number;
    variant_category?: string;
    energy_cost_factor: number;
    // The missing properties needed by AllExercisesPage
    primary_muscle_groups: any[];
    secondary_muscle_groups: any[];
    equipment_type: any[];
    metadata?: Record<string, any>;
  }) => void;
  initialExercise?: any;
  loading?: boolean;
}

export function ExerciseDialog({
  open,
  onOpenChange,
  mode = "add",
  onSubmit,
  initialExercise,
  loading = false,
}: ExerciseDialogProps) {
  // State for the active tab
  const [activeTab, setActiveTab] = useState<"basic" | "advanced" | "metrics" | "instructions">("basic");
  
  // State for form errors
  const [formError, setFormError] = useState("");
  
  // Use our custom hook for form state management
  const [exercise, handlers] = useExerciseFormState(initialExercise, open);

  // Type-safe tab change handler
  const handleTabChange = useCallback((value: string) => {
    if (value === "basic" || value === "advanced" || value === "metrics" || value === "instructions") {
      setActiveTab(value);
    }
  }, []);

  // Form submission handler
  const handleSubmit = useCallback(() => {
    if (!exercise.name.trim()) {
      setFormError("Exercise name is required");
      return;
    }
    
    setFormError("");
    onSubmit(exercise);
  }, [exercise, onSubmit]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {mode === "add" ? "Add Exercise" : "Edit Exercise"}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 overflow-auto mt-2 p-2 space-y-4">
            <TabsContent value="basic">
              <ExerciseDialogBasic 
                exercise={exercise}
                onChangeName={handlers.setName}
                onChangeDescription={handlers.setDescription}
              />
            </TabsContent>

            <TabsContent value="advanced">
              <ExerciseDialogAdvanced 
                exercise={exercise}
                onChangeDifficulty={handlers.setDifficulty}
                onChangeMovement={handlers.setMovementPattern}
                onToggleCompound={handlers.setIsCompound}
              />
            </TabsContent>

            <TabsContent value="metrics">
              <ExerciseDialogMetrics 
                exercise={exercise}
                onToggleBodyweight={handlers.setIsBodyweight}
                onChangeLoadPercent={handlers.setEstimatedLoadPercent}
              />
            </TabsContent>

            <TabsContent value="instructions">
              <ExerciseDialogInstructions 
                exercise={exercise}
                onChangeSteps={handlers.setInstructionsSteps}
                onChangeForm={handlers.setInstructionsForm}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {formError && <p className="mt-2 text-sm text-red-600">{formError}</p>}

        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : mode === "add" ? "Add Exercise" : "Update Exercise"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
