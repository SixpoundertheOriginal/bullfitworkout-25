
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
import { MovementPattern, Difficulty, Exercise, MuscleGroup } from "@/types/exercise";
import { useExerciseFormState, ExerciseFormState } from "@/hooks/useExerciseFormState";
import { ExerciseDialogBasic } from "@/components/exercises/ExerciseDialog/ExerciseDialogBasic";
import { ExerciseDialogAdvanced } from "@/components/exercises/ExerciseDialog/ExerciseDialogAdvanced";
import { ExerciseDialogMetrics } from "@/components/exercises/ExerciseDialog/ExerciseDialogMetrics";
import { ExerciseDialogInstructions } from "@/components/exercises/ExerciseDialog/ExerciseDialogInstructions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  baseExercise?: Exercise; // Prop for variation parent
  onSubmit: (exercise: {
    name: string;
    description: string;
    movement_pattern: MovementPattern;
    difficulty: Difficulty;
    instructions: { steps: string; form: string };
    is_compound: boolean;
    tips: string[];
    variations: string[];
    loading_type?: string;
    estimated_load_percent?: number;
    variant_category?: string;
    energy_cost_factor: number;
    is_bodyweight: boolean;
    // Variation fields
    base_exercise_id?: string;
    variation_type?: string;
    variation_value?: string;
    // The required properties needed by AllExercisesPage
    primary_muscle_groups: MuscleGroup[];
    secondary_muscle_groups: MuscleGroup[];
    equipment_type: string[];
    metadata?: Record<string, any>;
  }) => void;
  initialExercise?: any;
  loading?: boolean;
}

const VARIATION_TYPES = [
  "grip", 
  "angle", 
  "stance", 
  "equipment", 
  "tempo", 
  "range", 
  "resistance",
  "unilateral"
];

export function ExerciseDialog({
  open,
  onOpenChange,
  mode = "add",
  baseExercise,
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

  // Handle variation specific fields
  const handleVariationTypeChange = (value: string) => {
    if (handlers.setVariationType) {
      handlers.setVariationType(value);
    }
  };

  const handleVariationValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (handlers.setVariationValue) {
      handlers.setVariationValue(e.target.value);
    }
  };

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
    
    // Include variation fields in submission if there's a base exercise
    // Cast primary_muscle_groups and secondary_muscle_groups to MuscleGroup[] to satisfy TypeScript
    const submissionData = {
      ...exercise,
      base_exercise_id: baseExercise?.id || exercise.base_exercise_id,
      // Cast to appropriate types for API submission
      primary_muscle_groups: (Array.isArray(exercise.primary_muscle_groups) ? exercise.primary_muscle_groups : []) as MuscleGroup[],
      secondary_muscle_groups: (Array.isArray(exercise.secondary_muscle_groups) ? exercise.secondary_muscle_groups : []) as MuscleGroup[],
    };
    
    onSubmit(submissionData);
  }, [exercise, onSubmit, baseExercise]);

  // Set base exercise ID when baseExercise prop changes
  React.useEffect(() => {
    if (baseExercise?.id && handlers.setBaseExerciseId) {
      handlers.setBaseExerciseId(baseExercise.id);
    }
  }, [baseExercise, handlers]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {baseExercise ? 
              `Add Variation for ${baseExercise.name}` : 
              mode === "add" ? "Add Exercise" : "Edit Exercise"}
          </DialogTitle>
        </DialogHeader>

        {/* Show variation info when creating a variation */}
        {baseExercise && (
          <Alert className="bg-purple-900/20 border-purple-800 mb-4">
            <AlertCircle className="h-4 w-4 text-purple-300" />
            <AlertDescription className="text-sm text-purple-100">
              You're creating a variation of <span className="font-semibold">{baseExercise.name}</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Variation fields */}
        {baseExercise && (
          <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="variation-type">Variation Type</Label>
              <Select 
                value={exercise.variation_type || ''} 
                onValueChange={handleVariationTypeChange}
              >
                <SelectTrigger id="variation-type">
                  <SelectValue placeholder="Select variation type" />
                </SelectTrigger>
                <SelectContent>
                  {VARIATION_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="variation-value">Variation Value</Label>
              <Input
                id="variation-value"
                value={exercise.variation_value || ''}
                onChange={handleVariationValueChange}
                placeholder="e.g. Wide, 30°, Sumo, etc."
              />
            </div>
          </div>
        )}

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
                formError={formError}
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
            {loading ? "Saving..." : baseExercise ? "Add Variation" : mode === "add" ? "Add Exercise" : "Update Exercise"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
