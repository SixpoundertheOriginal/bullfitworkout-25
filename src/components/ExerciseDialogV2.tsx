
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Exercise, MuscleGroup, MovementPattern, Difficulty, DIFFICULTY_LEVELS, MOVEMENT_PATTERNS } from "@/types/exercise";
import { Variation, VARIATION_TYPES, getVariationLabel } from "@/types/exerciseVariation";
import { MUSCLE_GROUP_CATEGORIES } from "@/constants/exerciseMetadata";
import { useExercises } from "@/hooks/useExercises";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MultiSelect } from "@/components/MultiSelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ExercisePreview } from "@/components/exercises/ExercisePreview";
import { MuscleSelector } from "@/components/exercises/MuscleSelector";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { InstructionSteps } from "@/components/exercises/InstructionSteps";
import { VariationEditor } from "@/components/exercises/VariationEditor";
import { 
  AlertCircle, Dumbbell, Trash, Plus, LayoutGrid, Info, List, BookOpen, Zap, 
  MoveVertical, Layers, Settings, Save
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// Define the form schema with Zod
const exerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  description: z.string().optional(),
  movement_pattern: z.string(),
  difficulty: z.string(),
  is_compound: z.boolean().default(false),
  is_bodyweight: z.boolean().default(false),
  energy_cost_factor: z.number().default(1),
  estimated_load_percent: z.number().optional(),
  primary_muscle_groups: z.array(z.string()),
  secondary_muscle_groups: z.array(z.string()),
  equipment_type: z.array(z.string()),
  instructions_steps: z.string().optional(),
  instructions_form: z.string().optional(),
  base_exercise_id: z.string().optional(),
});

type ExerciseFormValues = z.infer<typeof exerciseSchema>;

interface ExerciseDialogV2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  baseExercise?: Exercise;
  onSubmit: (exerciseData: any) => void;
  initialExercise?: any;
  loading?: boolean;
}

export function ExerciseDialogV2({
  open,
  onOpenChange,
  mode = "add",
  baseExercise,
  onSubmit,
  initialExercise,
  loading = false,
}: ExerciseDialogV2Props) {
  // State
  const [activeTab, setActiveTab] = useState("basic");
  const [variations, setVariations] = useState<Variation[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [newTip, setNewTip] = useState("");
  const { exercises } = useExercises();

  // Setup form with react-hook-form
  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: "",
      description: "",
      movement_pattern: "push",
      difficulty: "beginner",
      is_compound: false,
      is_bodyweight: false,
      energy_cost_factor: 1,
      estimated_load_percent: undefined,
      primary_muscle_groups: [],
      secondary_muscle_groups: [],
      equipment_type: [],
      instructions_steps: "",
      instructions_form: "",
    },
  });

  // When initialExercise or baseExercise changes, update form values
  useEffect(() => {
    if (initialExercise) {
      // Reset form with initial values
      form.reset({
        name: initialExercise.name || "",
        description: initialExercise.description || "",
        movement_pattern: initialExercise.movement_pattern || "push",
        difficulty: initialExercise.difficulty || "beginner",
        is_compound: initialExercise.is_compound || false,
        is_bodyweight: initialExercise.is_bodyweight || false,
        energy_cost_factor: initialExercise.energy_cost_factor || 1,
        estimated_load_percent: initialExercise.estimated_load_percent,
        primary_muscle_groups: initialExercise.primary_muscle_groups || [],
        secondary_muscle_groups: initialExercise.secondary_muscle_groups || [],
        equipment_type: initialExercise.equipment_type || [],
        instructions_steps: initialExercise.instructions?.steps || "",
        instructions_form: initialExercise.instructions?.form || "",
        base_exercise_id: initialExercise.base_exercise_id,
      });

      // Set variations from initialExercise
      setVariations(initialExercise.variationList || []);
      
      // Set tips from initialExercise
      setTips(initialExercise.tips || []);
    } else if (baseExercise) {
      // If creating a variation, prefill with base exercise data
      form.setValue("base_exercise_id", baseExercise.id);
    } else {
      // Reset form for new exercise
      form.reset({
        name: "",
        description: "",
        movement_pattern: "push",
        difficulty: "beginner",
        is_compound: false,
        is_bodyweight: false,
        energy_cost_factor: 1,
        estimated_load_percent: undefined,
        primary_muscle_groups: [],
        secondary_muscle_groups: [],
        equipment_type: [],
        instructions_steps: "",
        instructions_form: "",
      });
      setVariations([]);
      setTips([]);
    }
  }, [initialExercise, baseExercise, form, open]);

  // Form submission handler
  const handleSubmit = form.handleSubmit((data) => {
    // Transform form data to match the expected exercise schema
    const exerciseData = {
      ...data,
      instructions: {
        steps: data.instructions_steps,
        form: data.instructions_form,
      },
      tips: tips,
      variations: [], // Legacy field
      variationList: variations,
      // Include these for compatibility with existing code
      base_exercise_id: baseExercise?.id || data.base_exercise_id,
      variation_type: variations[0]?.type,
      variation_value: variations[0]?.value,
    };

    // Remove the instructions_steps and instructions_form fields
    delete exerciseData.instructions_steps;
    delete exerciseData.instructions_form;

    onSubmit(exerciseData);
  });

  // Add a tip to the tips list
  const addTip = () => {
    if (newTip.trim()) {
      setTips([...tips, newTip.trim()]);
      setNewTip("");
    }
  };

  // Remove a tip from the tips list
  const removeTip = (index: number) => {
    setTips(tips.filter((_, i) => i !== index));
  };

  // Get all muscle group options
  const muscleGroupOptions = MUSCLE_GROUP_CATEGORIES.flatMap(category => 
    category.muscles.map(muscle => ({ label: muscle, value: muscle }))
  );

  // Get equipment options
  const equipmentOptions = [
    { label: "Barbell", value: "barbell" },
    { label: "Dumbbell", value: "dumbbell" },
    { label: "Kettlebell", value: "kettlebell" },
    { label: "Cable", value: "cable" },
    { label: "Machine", value: "machine" },
    { label: "Bodyweight", value: "bodyweight" },
    { label: "Resistance Band", value: "resistance band" },
    { label: "Smith Machine", value: "smith machine" },
    { label: "Box", value: "box" },
    { label: "Bench", value: "bench" },
    { label: "Other", value: "other" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            {baseExercise ? 
              `Add Variation for ${baseExercise.name}` : 
              mode === "add" ? "Add Exercise" : "Edit Exercise"}
          </DialogTitle>
        </DialogHeader>

        {/* Show variation info when creating a variation */}
        {baseExercise && (
          <Alert className="bg-purple-900/20 border-purple-800 mx-6 mb-4">
            <AlertCircle className="h-4 w-4 text-purple-300" />
            <AlertDescription className="text-sm text-purple-100">
              You're creating a variation of <span className="font-semibold">{baseExercise.name}</span>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4 flex flex-col flex-1 overflow-hidden">
            <div className="flex flex-col flex-1 overflow-hidden">
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col overflow-hidden px-6"
              >
                <TabsList className="grid grid-cols-6 mb-4">
                  <TabsTrigger value="basic" className="flex items-center gap-1">
                    <Info className="h-4 w-4" /> Basic
                  </TabsTrigger>
                  <TabsTrigger value="muscles" className="flex items-center gap-1">
                    <LayoutGrid className="h-4 w-4" /> Muscles
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="flex items-center gap-1">
                    <Settings className="h-4 w-4" /> Advanced
                  </TabsTrigger>
                  <TabsTrigger value="instructions" className="flex items-center gap-1">
                    <List className="h-4 w-4" /> Steps
                  </TabsTrigger>
                  <TabsTrigger value="variations" className="flex items-center gap-1">
                    <Layers className="h-4 w-4" /> Variations
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" /> Preview
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1 overflow-auto pr-4">
                  <div className="pb-6 space-y-8">
                    {/* Basic Tab */}
                    <TabsContent value="basic" className="space-y-6 mt-0">
                      <div className="grid grid-cols-1 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Exercise Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Bench Press, Squat, etc."
                                  {...field}
                                  className="text-base"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Brief description of the exercise..."
                                  {...field}
                                  className="min-h-[100px]"
                                />
                              </FormControl>
                              <FormDescription>
                                A short explanation of what this exercise works and how it's performed.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div>
                          <FormLabel htmlFor="tips">Quick Tips</FormLabel>
                          <div className="flex flex-wrap gap-2 mt-2 mb-4">
                            {tips.map((tip, index) => (
                              <Badge 
                                key={index} 
                                className="bg-gray-800 text-white flex items-center gap-1"
                              >
                                {tip}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 ml-1 text-gray-400 hover:text-white"
                                  onClick={() => removeTip(index)}
                                >
                                  <Trash className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              id="new-tip"
                              value={newTip}
                              onChange={(e) => setNewTip(e.target.value)}
                              placeholder="Add a quick tip..."
                              className="flex-1"
                            />
                            <Button 
                              type="button" 
                              onClick={addTip}
                              variant="outline"
                              className="shrink-0"
                            >
                              <Plus className="h-4 w-4 mr-1" /> Add
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Tips help users get the most out of the exercise
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Muscles Tab */}
                    <TabsContent value="muscles" className="space-y-6 mt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <MuscleSelector 
                            selectedPrimary={form.watch("primary_muscle_groups")}
                            selectedSecondary={form.watch("secondary_muscle_groups")}
                            onPrimarySelect={(muscles) => form.setValue("primary_muscle_groups", muscles)}
                            onSecondarySelect={(muscles) => form.setValue("secondary_muscle_groups", muscles)}
                          />
                        </div>
                        
                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="primary_muscle_groups"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Primary Muscle Groups</FormLabel>
                                <FormControl>
                                  <MultiSelect
                                    options={muscleGroupOptions}
                                    selected={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select primary muscles..."
                                  />
                                </FormControl>
                                <FormDescription>
                                  The main muscles targeted by this exercise
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="secondary_muscle_groups"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Secondary Muscle Groups</FormLabel>
                                <FormControl>
                                  <MultiSelect
                                    options={muscleGroupOptions}
                                    selected={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select secondary muscles..."
                                  />
                                </FormControl>
                                <FormDescription>
                                  Additional muscles that are worked during this exercise
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="equipment_type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Equipment</FormLabel>
                                <FormControl>
                                  <MultiSelect
                                    options={equipmentOptions}
                                    selected={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select equipment..."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    {/* Advanced Tab */}
                    <TabsContent value="advanced" className="space-y-6 mt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="movement_pattern"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Movement Pattern</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select movement pattern" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {MOVEMENT_PATTERNS.map(pattern => (
                                      <SelectItem key={pattern} value={pattern}>
                                        {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  The fundamental movement type this exercise uses
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="difficulty"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Difficulty Level</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select difficulty" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {DIFFICULTY_LEVELS.map(level => (
                                      <SelectItem key={level} value={level}>
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  How challenging this exercise is to perform correctly
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="is_compound"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Compound Exercise</FormLabel>
                                  <FormDescription>
                                    Works multiple muscle groups across multiple joints
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="is_bodyweight"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Bodyweight Exercise</FormLabel>
                                  <FormDescription>
                                    Uses body weight as the primary resistance
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                      // Add bodyweight to equipment if checked and not already there
                                      if (checked) {
                                        const equipment = form.getValues("equipment_type");
                                        if (!equipment.includes("bodyweight")) {
                                          form.setValue("equipment_type", [...equipment, "bodyweight"]);
                                        }
                                      }
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {form.watch("is_bodyweight") && (
                            <FormField
                              control={form.control}
                              name="estimated_load_percent"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Bodyweight Load Percentage</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="65"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      className="w-full"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Estimated percentage of bodyweight used in this exercise (e.g., push-ups use ~65%)
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Instructions Tab */}
                    <TabsContent value="instructions" className="space-y-6 mt-0">
                      <div className="grid grid-cols-1 gap-6">
                        <FormField
                          control={form.control}
                          name="instructions_steps"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Step-by-Step Instructions</FormLabel>
                              <FormControl>
                                <InstructionSteps
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormDescription>
                                Detailed steps for performing this exercise correctly
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="instructions_form"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Form Tips</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Guidelines for maintaining proper form..."
                                  {...field}
                                  className="min-h-[100px]"
                                />
                              </FormControl>
                              <FormDescription>
                                Key points to focus on for maintaining proper form
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    {/* Variations Tab */}
                    <TabsContent value="variations" className="space-y-6 mt-0">
                      <VariationEditor
                        variations={variations}
                        onChange={setVariations}
                      />
                    </TabsContent>

                    {/* Preview Tab */}
                    <TabsContent value="preview" className="space-y-6 mt-0">
                      <div className="flex justify-center">
                        <div className="w-full max-w-md">
                          <ExercisePreview
                            exercise={{
                              name: form.watch("name") || "Exercise Name",
                              description: form.watch("description") || "No description provided",
                              primary_muscle_groups: form.watch("primary_muscle_groups") || [],
                              secondary_muscle_groups: form.watch("secondary_muscle_groups") || [],
                              difficulty: form.watch("difficulty") as Difficulty || "beginner",
                              movement_pattern: form.watch("movement_pattern") as MovementPattern || "push",
                              is_compound: form.watch("is_compound") || false,
                              is_bodyweight: form.watch("is_bodyweight") || false,
                              equipment_type: form.watch("equipment_type") || [],
                              instructions: {
                                steps: form.watch("instructions_steps") || "",
                                form: form.watch("instructions_form") || ""
                              },
                              tips: tips,
                              variations: [],
                              variationList: variations,
                            }}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </ScrollArea>
              </Tabs>
            </div>

            <DialogFooter className="px-6 py-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2" disabled={loading}>
                <Save className="h-4 w-4" />
                {loading ? "Saving..." : baseExercise ? "Add Variation" : mode === "add" ? "Add Exercise" : "Update Exercise"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
