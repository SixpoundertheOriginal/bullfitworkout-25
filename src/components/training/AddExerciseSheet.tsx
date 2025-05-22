import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Plus, Filter, X, ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Exercise } from "@/types/exercise";
import { useExerciseSuggestions } from "@/hooks/useExerciseSuggestions";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { useExercises } from "@/hooks/useExercises";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AllExercisesPage from "@/pages/AllExercisesPage";
import { ExerciseDialogV2 } from '@/components/ExerciseDialogV2';
import { getExerciseName } from "@/utils/exerciseAdapter";
import { EnhancedExerciseCard } from '@/components/exercises/EnhancedExerciseCard';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

interface AddExerciseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectExercise?: (exerciseName: string) => void;
  trainingType?: string;
}

export const AddExerciseSheet: React.FC<AddExerciseSheetProps> = ({
  open,
  onOpenChange,
  onSelectExercise = () => {}, // Default to empty function
  trainingType = ""
}) => {
  // Add detailed logging
  console.log('📋 AddExerciseSheet: Rendering with open state:', open);
  
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<string>("suggested");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { suggestedExercises = [] } = useExerciseSuggestions(trainingType);
  const { workouts = [] } = useWorkoutHistory();
  const { exercises: allExercises = [] } = useExercises();
  const [showAllExercises, setShowAllExercises] = useState(false);
  const [exerciseDialogV2Open, setExerciseDialogV2Open] = useState(false);
  const [isClosePending, setIsClosePending] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("all");

  // Track whether a selection has been made recently
  const [hasRecentlySelected, setHasRecentlySelected] = useState(false);

  // Add effect to track open state changes
  useEffect(() => {
    console.log('📋 AddExerciseSheet: Open state changed to:', open);
    
    // If sheet is opening, reset the selection flag
    if (open) {
      setHasRecentlySelected(false);
      setIsClosePending(false);
      setSearchQuery("");
    }
  }, [open]);

  // Extract recently used exercises from workout history
  const recentExercises = React.useMemo(() => {
    // Ensure workouts and allExercises are arrays
    if (!Array.isArray(workouts) || !workouts?.length || !Array.isArray(allExercises) || !allExercises?.length) return [];
    
    const exerciseMap = new Map<string, Exercise>();
    
    // Get unique exercise names from recent workouts
    workouts.slice(0, 8).forEach(workout => {
      if (!workout) return;
      const exerciseNames = new Set<string>();
      
      if (workout?.exerciseSets && Array.isArray(workout.exerciseSets)) {
        workout.exerciseSets.forEach(set => {
          if (set?.exercise_name) {
            exerciseNames.add(set.exercise_name);
          }
        });
      }
      
      exerciseNames.forEach(name => {
        const exercise = allExercises.find(e => e?.name === name);
        if (exercise && !exerciseMap.has(exercise.id || '')) {
          exerciseMap.set(exercise.id || '', exercise);
        }
      });
    });
    
    return Array.from(exerciseMap.values());
  }, [workouts, allExercises]);

  // Filter exercises based on search query and filters
  const filteredSuggested = React.useMemo(() => {
    // Ensure suggestedExercises is an array
    if (!Array.isArray(suggestedExercises)) return [];
    
    let filtered = suggestedExercises;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(e => 
        e && e.name && e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e && e.primary_muscle_groups && Array.isArray(e.primary_muscle_groups) && 
         e.primary_muscle_groups.some(m => m && m.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }
    
    // Apply muscle group filter
    if (selectedMuscleGroup !== "all") {
      filtered = filtered.filter(e => 
        e && e.primary_muscle_groups && Array.isArray(e.primary_muscle_groups) && 
        e.primary_muscle_groups.includes(selectedMuscleGroup)
      );
    }
    
    return filtered;
  }, [suggestedExercises, searchQuery, selectedMuscleGroup]);

  const filteredRecent = React.useMemo(() => {
    // Ensure recentExercises is an array
    if (!Array.isArray(recentExercises)) return [];
    
    let filtered = recentExercises;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(e => 
        e && e.name && e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e && e.primary_muscle_groups && Array.isArray(e.primary_muscle_groups) && 
         e.primary_muscle_groups.some(m => m && m.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }
    
    // Apply muscle group filter
    if (selectedMuscleGroup !== "all") {
      filtered = filtered.filter(e => 
        e && e.primary_muscle_groups && Array.isArray(e.primary_muscle_groups) && 
        e.primary_muscle_groups.includes(selectedMuscleGroup)
      );
    }
    
    return filtered;
  }, [recentExercises, searchQuery, selectedMuscleGroup]);

  // Common muscle groups for quick filters
  const quickFilterMuscleGroups = [
    "chest", "back", "shoulders", "biceps", "triceps", "legs", "core"
  ];

  // Always pass exercise name string and prevent double selections
  const handleAddExercise = (exercise: Exercise | string) => {
    const exerciseName = getExerciseName(exercise);
    console.log('📋 AddExerciseSheet: handleAddExercise called with', exerciseName);
    
    if (hasRecentlySelected) {
      console.log('📋 AddExerciseSheet: Ignoring duplicate selection');
      return;
    }
    
    // Mark that we've made a selection to prevent duplicates
    setHasRecentlySelected(true);
    
    // Call the parent handler with the exercise name
    onSelectExercise(exerciseName);
    
    // Show toast notification
    toast({
      title: "Exercise added",
      description: `Added ${exerciseName} to your workout`
    });
    
    // Close the sheet after a short delay
    setTimeout(() => {
      onOpenChange(false);
    }, 300);
  };

  // Handle open state changes with better logging
  const handleOpenChange = (isOpen: boolean) => {
    console.log('📋 AddExerciseSheet: handleOpenChange called with', isOpen);
    
    // If trying to close, check if we just selected an exercise
    if (!isOpen && hasRecentlySelected) {
      console.log('📋 AddExerciseSheet: Detected close after selection, delaying to ensure exercise is added');
      setIsClosePending(true);
      return;
    }
    
    // Otherwise, pass through the open state change
    onOpenChange(isOpen);
  };

  // Function to handle creating a new exercise
  const handleCreateExercise = () => {
    setExerciseDialogV2Open(true);
  };

  // If showing all exercises page
  if (showAllExercises) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] rounded-t-xl border-t border-gray-700 bg-gray-900 p-0 z-[100]"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllExercises(false)}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <h2 className="text-lg font-semibold">Browse All Exercises</h2>
            <div className="w-10"></div> {/* Spacer for alignment */}
          </div>
          <AllExercisesPage 
            onSelectExercise={(exercise) => handleAddExercise(getExerciseName(exercise))}
            standalone={false}
            onBack={() => setShowAllExercises(false)}
          />
        </SheetContent>
      </Sheet>
    );
  }

  console.log('📋 AddExerciseSheet: Before final return with open =', open);
  
  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[80vh] rounded-t-xl border-t border-gray-700 bg-gray-900 p-0 z-[100]"
      >
        <div className="flex flex-col h-full">
          {/* Handle for dragging */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-12 h-1.5 bg-gray-700 rounded-full"></div>
          </div>
          
          <div className="px-4 pb-2 h-full flex flex-col">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-xl font-bold text-center">Add an Exercise</SheetTitle>
            </SheetHeader>
            
            {/* Search bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search exercises..."
                className="pl-9 bg-gray-800 border-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-2 top-1.5 h-7 w-7 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Quick filters */}
            <ScrollArea className="w-full">
              <div className="flex space-x-2 mb-4 pb-1 pt-1 overflow-x-auto">
                <Badge 
                  variant={selectedMuscleGroup === "all" ? "default" : "outline"} 
                  className={`cursor-pointer py-1 px-3 ${selectedMuscleGroup === "all" ? "bg-purple-600" : "bg-gray-800 hover:bg-gray-700"}`}
                  onClick={() => setSelectedMuscleGroup("all")}
                >
                  All
                </Badge>
                
                {quickFilterMuscleGroups.map(muscle => (
                  <Badge 
                    key={muscle}
                    variant={selectedMuscleGroup === muscle ? "default" : "outline"} 
                    className={`cursor-pointer py-1 px-3 capitalize ${selectedMuscleGroup === muscle ? "bg-purple-600" : "bg-gray-800 hover:bg-gray-700"}`}
                    onClick={() => setSelectedMuscleGroup(muscle)}
                  >
                    {muscle}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
            
            {/* Tabs */}
            <Tabs defaultValue="suggested" className="w-full flex-1 flex flex-col" onValueChange={setActiveTab} value={activeTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="suggested">Suggested</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="browse" onClick={() => setShowAllExercises(true)}>Browse All</TabsTrigger>
              </TabsList>
              
              <TabsContent value="suggested" className="mt-0 flex-1 overflow-hidden">
                <ScrollArea className="h-[calc(80vh-220px)]">
                  {Array.isArray(filteredSuggested) && filteredSuggested.length > 0 ? (
                    <div className="space-y-2 pr-2">
                      {filteredSuggested.map(exercise => exercise ? (
                        <EnhancedExerciseCard
                          key={exercise.id || exercise.name}
                          exerciseName={exercise.name}
                          exerciseData={exercise}
                          onAdd={() => handleAddExercise(exercise)}
                        />
                      ) : null)}
                    </div>
                  ) : (
                    <div className="text-center py-6 flex flex-col items-center">
                      <p className="text-gray-400 mb-4">No suggested exercises found</p>
                      <Button 
                        variant="outline" 
                        onClick={handleCreateExercise}
                        className="bg-purple-900/20 border-purple-700/30"
                      >
                        <Plus size={16} className="mr-2" />
                        Create New Exercise
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="recent" className="mt-0 flex-1 overflow-hidden">
                <ScrollArea className="h-[calc(80vh-220px)]">
                  {Array.isArray(filteredRecent) && filteredRecent.length > 0 ? (
                    <div className="space-y-2 pr-2">
                      {filteredRecent.map(exercise => exercise ? (
                        <EnhancedExerciseCard
                          key={exercise.id || exercise.name}
                          exerciseName={exercise.name}
                          exerciseData={exercise}
                          onAdd={() => handleAddExercise(exercise)}
                        />
                      ) : null)}
                    </div>
                  ) : (
                    <div className="text-center py-6 flex flex-col items-center">
                      <p className="text-gray-400 mb-4">No recent exercises found</p>
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab("suggested")}
                      >
                        View Suggested Exercises
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
            
            {/* Create new exercise button */}
            <div className="pt-4 border-t border-gray-800 mt-4">
              <Button 
                variant="outline"
                onClick={handleCreateExercise}
                className="w-full bg-purple-900/20 border-purple-700/30"
              >
                <Plus size={16} className="mr-2" />
                Create New Exercise
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
      <ExerciseDialogV2
        open={exerciseDialogV2Open}
        onOpenChange={setExerciseDialogV2Open}
        mode="add"
        onSubmit={(exercise) => {
          const exerciseName = getExerciseName(exercise);
          handleAddExercise(exerciseName);
          setExerciseDialogV2Open(false);
        }}
      />
    </Sheet>
  );
};
