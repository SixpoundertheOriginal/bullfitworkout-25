// src/components/exercises/ExerciseDialog.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  MovementPattern,
  Difficulty,
  MOVEMENT_PATTERNS,
  DIFFICULTY_LEVELS,
} from "@/constants/exerciseMetadata";

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
  const [activeTab, setActiveTab] = useState<"basic" | "advanced" | "metrics" | "instructions">("basic");
  const [exercise, setExercise] = useState({
    name: "",
    description: "",
    movement_pattern: "push" as MovementPattern,
    difficulty: "beginner" as Difficulty,
    instructions: { steps: "", form: "" },
    is_compound: false,
    tips: [] as string[],
    variations: [] as string[],
    loading_type: undefined as string | undefined,
    estimated_load_percent: undefined as number | undefined,
    variant_category: undefined as string | undefined,
    is_bodyweight: false,
    energy_cost_factor: 1,
  });
  const [newTip, setNewTip] = useState("");
  const [newVariation, setNewVariation] = useState("");
  const [formError, setFormError] = useState("");

  // reset or seed form
  useEffect(() => {
    if (initialExercise) {
      setExercise({
        ...exercise,
        ...initialExercise,
        instructions: {
          steps: initialExercise.instructions?.steps ?? "",
          form: initialExercise.instructions?.form ?? "",
        },
      });
    } else {
      setExercise((ex) => ({
        ...ex,
        name: "",
        description: "",
        movement_pattern: "push",
        difficulty: "beginner",
        instructions: { steps: "", form: "" },
        is_compound: false,
        tips: [],
        variations: [],
        loading_type: undefined,
        estimated_load_percent: undefined,
        variant_category: undefined,
        is_bodyweight: false,
        energy_cost_factor: 1,
      }));
    }
    setFormError("");
    setActiveTab("basic");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialExercise, open]);

  // keep bodyweight flag in sync
  useEffect(() => {
    if (exercise.is_bodyweight) {
      setExercise((ex) => ({ ...ex, is_bodyweight: true }));
    }
  }, [exercise.is_bodyweight]);

  const addTip = () => {
    if (newTip.trim()) {
      setExercise((ex) => ({ ...ex, tips: [...ex.tips, newTip.trim()] }));
      setNewTip("");
    }
  };
  const removeTip = (i: number) =>
    setExercise((ex) => ({ ...ex, tips: ex.tips.filter((_, idx) => idx !== i) }));

  const addVariation = () => {
    if (newVariation.trim()) {
      setExercise((ex) => ({
        ...ex,
        variations: [...ex.variations, newVariation.trim()],
      }));
      setNewVariation("");
    }
  };
  const removeVariation = (i: number) =>
    setExercise((ex) => ({
      ...ex,
      variations: ex.variations.filter((_, idx) => idx !== i),
    }));

  const handleSubmit = () => {
    if (!exercise.name.trim()) {
      setFormError("Exercise name is required");
      return;
    }
    // no other validations since we removed muscle/equipment
    onSubmit(exercise);
  };

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
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 overflow-auto mt-2 p-2 space-y-4">
            {/* BASIC */}
            <TabsContent value="basic">
              <div>
                <Label htmlFor="name">Exercise Name*</Label>
                <Input
                  id="name"
                  placeholder="e.g. Bench Press"
                  value={exercise.name}
                  onChange={(e) => setExercise({ ...exercise, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description…"
                  value={exercise.description}
                  onChange={(e) =>
                    setExercise({ ...exercise, description: e.target.value })
                  }
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>

            {/* ADVANCED */}
            <TabsContent value="advanced">
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={exercise.difficulty}
                  onValueChange={(v) =>
                    setExercise({ ...exercise, difficulty: v as Difficulty })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map((lvl) => (
                      <SelectItem key={lvl} value={lvl}>
                        {lvl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="movement">Movement Pattern</Label>
                <Select
                  value={exercise.movement_pattern}
                  onValueChange={(v) =>
                    setExercise({ ...exercise, movement_pattern: v as MovementPattern })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select movement" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOVEMENT_PATTERNS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_compound"
                  checked={exercise.is_compound}
                  onCheckedChange={(c) =>
                    setExercise({ ...exercise, is_compound: c as boolean })
                  }
                />
                <Label htmlFor="is_compound">Compound exercise</Label>
              </div>
            </TabsContent>

            {/* METRICS */}
            <TabsContent value="metrics">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_bodyweight"
                  checked={exercise.is_bodyweight}
                  onCheckedChange={(c) =>
                    setExercise({ ...exercise, is_bodyweight: c as boolean })
                  }
                />
                <Label htmlFor="is_bodyweight">Bodyweight exercise</Label>
              </div>
              {exercise.is_bodyweight && (
                <div>
                  <Label htmlFor="estimated_load_percent">
                    Estimated Body Load (%)
                  </Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      defaultValue={[exercise.estimated_load_percent ?? 65]}
                      min={10}
                      max={100}
                      step={5}
                      onValueChange={(v) =>
                        setExercise({ ...exercise, estimated_load_percent: v[0] })
                      }
                      className="flex-1"
                    />
                    <span className="w-16 text-center">
                      {exercise.estimated_load_percent ?? 65}%
                    </span>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* INSTRUCTIONS */}
            <TabsContent value="instructions">
              <div>
                <Label>Exercise Instructions</Label>
                <Textarea
                  placeholder="Step-by-step instructions…"
                  value={exercise.instructions.steps}
                  onChange={(e) =>
                    setExercise({
                      ...exercise,
                      instructions: { ...exercise.instructions, steps: e.target.value },
                    })
                  }
                  className="min-h-[200px]"
                />
              </div>
              <div>
                <Label>Form Cues</Label>
                <Textarea
                  placeholder="Form cues…"
                  value={exercise.instructions.form}
                  onChange={(e) =>
                    setExercise({
                      ...exercise,
                      instructions: { ...exercise.instructions, form: e.target.value },
                    })
                  }
                  className="min-h-[100px]"
                />
              </div>
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
