import React, { useState } from "react";
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
import { MovementPattern, Difficulty, Exercise, MuscleGroup } from "@/types/exercise";
import { Variation } from "@/types/exerciseVariation";
import { X } from "lucide-react";
import { useExerciseFormState } from "@/hooks/useExerciseFormState";

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
      <DialogContent className="bg-gray-900 border border-gray-800 text-white max-w-md p-0 gap-0 rounded-lg overflow-hidden">
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
            <TabsList className="bg-transparent h-12 w-full rounded-none flex">
              <TabsTrigger 
                value="basic" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:shadow-none text-sm"
              >
                Basic
              </TabsTrigger>
              <TabsTrigger 
                value="advanced" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:shadow-none text-sm"
              >
                Advanced
              </TabsTrigger>
              <TabsTrigger 
                value="muscles" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:shadow-none text-sm"
              >
                Muscles
              </TabsTrigger>
              <TabsTrigger 
                value="metrics" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:shadow-none text-sm"
              >
                Metrics
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
          </div>
          
          <div className="p-6">
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
            
            {/* Other tab contents would go here */}
            <TabsContent value="advanced" className="mt-0">
              {/* Advanced tab content */}
              <div className="text-center py-4 text-gray-400">
                Advanced options for this exercise
              </div>
            </TabsContent>
            
            <TabsContent value="muscles" className="mt-0">
              {/* Muscles tab content */}
              <div className="text-center py-4 text-gray-400">
                Configure muscle groups targeted by this exercise
              </div>
            </TabsContent>
            
            <TabsContent value="metrics" className="mt-0">
              {/* Metrics tab content */}
              <div className="text-center py-4 text-gray-400">
                Metrics for tracking and progression
              </div>
            </TabsContent>
            
            <TabsContent value="variations" className="mt-0">
              {/* Variations tab content */}
              <div className="text-center py-4 text-gray-400">
                Add variations of this exercise
              </div>
            </TabsContent>
            
            <TabsContent value="instructions" className="mt-0">
              {/* Instructions tab content */}
              <div className="text-center py-4 text-gray-400">
                Add detailed instructions for performing this exercise
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <DialogFooter className="p-6 pt-0 flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="bg-transparent border-gray-700 text-white hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? "Saving..." : mode === "add" ? "Add Exercise" : "Update Exercise"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
