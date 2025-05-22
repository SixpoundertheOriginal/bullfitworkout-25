import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MovementPattern, 
  Difficulty, 
  Exercise, 
  MuscleGroup,
  COMMON_MUSCLE_GROUPS,
  COMMON_EQUIPMENT,
  MOVEMENT_PATTERNS,
  DIFFICULTY_LEVELS
} from "@/types/exercise";
import { Variation, VARIATION_TYPES, getVariationLabel } from "@/types/exerciseVariation";
import { X, Plus, Trash2 } from "lucide-react";
import { useExerciseFormState } from "@/hooks/useExerciseFormState";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ExerciseDialogV2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  baseExercise?: Exercise;
  onSubmit: (exercise: any) => void;
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
  const [activeTab, setActiveTab] = useState("basic");
  const [exercise, handlers] = useExerciseFormState(initialExercise, open);
  
  // Reset tab when dialog opens
  useEffect(() => {
    if (open) {
      setActiveTab("basic");
    }
  }, [open]);
  
  const handleSubmit = () => {
    if (!exercise.name) {
      return;
    }
    
    const submissionData = {
      ...exercise,
      base_exercise_id: baseExercise?.id || exercise.base_exercise_id,
      primary_muscle_groups: Array.isArray(exercise.primary_muscle_groups) ? exercise.primary_muscle_groups : [],
      secondary_muscle_groups: Array.isArray(exercise.secondary_muscle_groups) ? exercise.secondary_muscle_groups : [],
      equipment_type: Array.isArray(exercise.equipment_type) ? exercise.equipment_type : [],
      variationList: exercise.variationList || []
    };
    
    onSubmit(submissionData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border border-gray-800 text-white max-w-md p-0 gap-0 rounded-lg overflow-hidden max-h-[90vh]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold flex items-center justify-between">
            {mode === "add" ? "Add Exercise" : "Edit Exercise"}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-800">
            <ScrollArea className="w-full overflow-x-auto">
              <TabsList className="bg-transparent h-12 w-full rounded-none flex">
                <TabsTrigger 
                  value="basic" 
                  className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:shadow-none text-sm"
                >
                  Basic
                </TabsTrigger>
                <TabsTrigger 
                  value="muscles" 
                  className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:shadow-none text-sm"
                >
                  Muscles
                </TabsTrigger>
                <TabsTrigger 
                  value="advanced" 
                  className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:shadow-none text-sm"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger 
                  value="variations" 
                  className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:shadow-none text-sm"
                >
                  Variations
                </TabsTrigger>
                <TabsTrigger 
                  value="instructions" 
                  className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:shadow-none text-sm"
                >
                  Instructions
                </TabsTrigger>
              </TabsList>
            </ScrollArea>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <TabsContent value="basic" className="mt-0">
              <form className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Exercise Name*
                  </label>
                  <Input
                    id="name"
                    placeholder="e.g. Bench Press"
                    value={exercise.name}
                    onChange={(e) => handlers.setName(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Brief description..."
                    value={exercise.description}
                    onChange={(e) => handlers.setDescription(e.target.value)}
                    className="bg-gray-800 border-gray-700 min-h-[120px]"
                  />
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="muscles" className="mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Primary Muscle Groups
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {COMMON_MUSCLE_GROUPS.map((muscle) => (
                      <div key={muscle} className="flex items-center space-x-2">
                        <Checkbox
                          id={`primary-${muscle}`}
                          checked={exercise.primary_muscle_groups?.includes(muscle)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handlers.addPrimaryMuscle(muscle);
                            } else {
                              handlers.removePrimaryMuscle(muscle);
                            }
                          }}
                        />
                        <label
                          htmlFor={`primary-${muscle}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                        >
                          {muscle}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Secondary Muscle Groups
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {COMMON_MUSCLE_GROUPS.map((muscle) => (
                      <div key={muscle} className="flex items-center space-x-2">
                        <Checkbox
                          id={`secondary-${muscle}`}
                          checked={exercise.secondary_muscle_groups?.includes(muscle)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handlers.addSecondaryMuscle(muscle);
                            } else {
                              handlers.removeSecondaryMuscle(muscle);
                            }
                          }}
                        />
                        <label
                          htmlFor={`secondary-${muscle}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                        >
                          {muscle}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Movement Pattern
                  </label>
                  <Select
                    value={exercise.movement_pattern || ""}
                    onValueChange={(value) => handlers.setMovementPattern(value as MovementPattern)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select movement pattern" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      {MOVEMENT_PATTERNS.map((pattern) => (
                        <SelectItem key={pattern} value={pattern} className="capitalize">
                          {pattern}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Difficulty Level
                  </label>
                  <Select
                    value={exercise.difficulty || ""}
                    onValueChange={(value) => handlers.setDifficulty(value as Difficulty)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      {DIFFICULTY_LEVELS.map((level) => (
                        <SelectItem key={level} value={level} className="capitalize">
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Equipment Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {COMMON_EQUIPMENT.map((equipment) => (
                      <div key={equipment} className="flex items-center space-x-2">
                        <Checkbox
                          id={`equipment-${equipment}`}
                          checked={exercise.equipment_type?.includes(equipment)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handlers.addEquipment(equipment);
                            } else {
                              handlers.removeEquipment(equipment);
                            }
                          }}
                        />
                        <label
                          htmlFor={`equipment-${equipment}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                        >
                          {equipment}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Exercise Type
                  </label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is-compound"
                      checked={exercise.is_compound}
                      onCheckedChange={(checked) => handlers.setIsCompound(!!checked)}
                    />
                    <label
                      htmlFor="is-compound"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Compound exercise
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is-bodyweight"
                      checked={exercise.is_bodyweight}
                      onCheckedChange={(checked) => handlers.setIsBodyweight(!!checked)}
                    />
                    <label
                      htmlFor="is-bodyweight"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Bodyweight exercise
                    </label>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="variations" className="mt-0">
              <div className="space-y-4">
                {exercise.variationList && exercise.variationList.length > 0 ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Exercise Variations
                    </label>
                    
                    <div className="space-y-2">
                      {exercise.variationList.map((variation: Variation, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                          <div>
                            <Badge className="mr-2 bg-purple-900/50 border-purple-500/20">{variation.type}</Badge>
                            <span>{variation.value}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlers.removeVariationFromList(index)}
                            className="h-8 w-8 p-0 hover:bg-red-900/30 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    No variations added yet
                  </div>
                )}
                
                <div className="pt-2">
                  <Button
                    onClick={() => {
                      handlers.addVariationToList({
                        type: "grip_width" as any, // Cast as any to satisfy TS
                        value: "wide grip"
                      });
                    }}
                    className="w-full bg-purple-900/30 hover:bg-purple-800/50 border border-purple-700/30"
                    variant="outline"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Variation
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="instructions" className="mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Instruction Steps
                  </label>
                  
                  {Array.isArray(exercise.instructions?.steps) && exercise.instructions.steps.length > 0 ? (
                    <div className="space-y-2">
                      {exercise.instructions.steps.map((step: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="bg-purple-900/50 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-xs">{index + 1}</span>
                          </div>
                          <Textarea
                            value={step}
                            onChange={(e) => handlers.updateInstructionStep(index, e.target.value)}
                            className="bg-gray-800 border-gray-700 min-h-[80px] flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlers.removeInstructionStep(index)}
                            className="h-8 w-8 p-0 hover:bg-red-900/30 hover:text-red-500 flex-shrink-0 mt-1"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400 bg-gray-800/30 rounded-md">
                      No instruction steps added yet
                    </div>
                  )}
                  
                  <Button
                    onClick={() => handlers.addInstructionStep("")}
                    className="w-full mt-2 bg-gray-800 hover:bg-gray-700"
                    variant="outline"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Step
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="video-url" className="text-sm font-medium">
                    Video URL
                  </label>
                  <Input
                    id="video-url"
                    placeholder="e.g. https://example.com/video.mp4"
                    value={exercise.instructions?.video_url || ""}
                    onChange={(e) => handlers.setInstructionVideoUrl(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <DialogFooter className="p-6 pt-0 flex justify-end gap-3 border-t border-gray-800 mt-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="bg-transparent border-gray-700 text-white hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !exercise.name}
            className={cn(
              "bg-purple-600 hover:bg-purple-700",
              (!exercise.name || loading) && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading ? "Saving..." : mode === "add" ? "Add Exercise" : "Update Exercise"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
