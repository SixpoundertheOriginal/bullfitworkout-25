import React, { useState, useEffect } from "react";
import { useExercises } from "@/hooks/useExercises";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, X, ChevronLeft, Dumbbell, Sparkles, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ExerciseDialog } from "@/components/ExerciseDialog";
import { MuscleGroup, EquipmentType, MovementPattern, Difficulty, Exercise } from "@/types/exercise";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ExerciseFAB } from "@/components/ExerciseFAB";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/navigation/PageHeader";
import { COMMON_MUSCLE_GROUPS, COMMON_EQUIPMENT, MOVEMENT_PATTERNS, DIFFICULTY_LEVELS } from "@/types/exercise";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { CommonExerciseCard } from "@/components/exercises/CommonExerciseCard";
import { ExerciseVariationGroup } from "@/components/exercises/ExerciseVariationGroup";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";

interface AllExercisesPageProps {
  onSelectExercise?: (exercise: string | Exercise) => void;
  standalone?: boolean;
  onBack?: () => void;
}

export default function AllExercisesPage({ onSelectExercise, standalone = true, onBack }: AllExercisesPageProps) {
  const { user } = useAuth();
  const { exercises = [], isLoading, isError, createExercise, updateExercise, deleteExercise, isPending } = useExercises();
  const { workouts = [] } = useWorkoutHistory();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<string>("suggested");
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | "all">("all");
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "all">("all");
  const [selectedMovement, setSelectedMovement] = useState<MovementPattern | "all">("all");

  const [currentPage, setCurrentPage] = useState(1);
  const exercisesPerPage = 8;

  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);
  const [baseExerciseForVariation, setBaseExerciseForVariation] = useState<Exercise | null>(null);

  const recentExercises = React.useMemo(() => {
    if (!workouts?.length) return [];
    if (!Array.isArray(exercises) || exercises.length === 0) return [];
    
    const exerciseMap = new Map<string, Exercise>();
    
    workouts.slice(0, 8).forEach(workout => {
      const exerciseNames = new Set<string>();
      
      if (workout.exerciseSets && Array.isArray(workout.exerciseSets)) {
        workout.exerciseSets.forEach(set => {
          if (set && set.exercise_name) {
            exerciseNames.add(set.exercise_name);
          }
        });
      }
      
      exerciseNames.forEach(name => {
        const exercise = exercises.find(e => e && e.name === name);
        if (exercise && !exerciseMap.has(exercise.id)) {
          exerciseMap.set(exercise.id, exercise);
        }
      });
    });
    
    return Array.from(exerciseMap.values());
  }, [workouts, exercises]);

  const filterExercises = (exercisesList: Exercise[] = []) => {
    if (!exercisesList || !Array.isArray(exercisesList) || exercisesList.length === 0) return [];
    
    return exercisesList.filter(exercise => {
      if (!exercise) return false;
      
      const searchableText = [
        exercise.name,
        exercise.description,
        exercise.variation_type,
        exercise.variation_value,
        ...(Array.isArray(exercise.primary_muscle_groups) ? exercise.primary_muscle_groups : []),
        ...(Array.isArray(exercise.secondary_muscle_groups) ? exercise.secondary_muscle_groups : [])
      ].filter(Boolean).join(' ').toLowerCase();
      
      const matchesSearch = searchQuery === "" || searchableText.includes(searchQuery.toLowerCase());

      const matchesMuscleGroup = selectedMuscleGroup === "all" || 
        (exercise.primary_muscle_groups && Array.isArray(exercise.primary_muscle_groups) && 
          exercise.primary_muscle_groups.includes(selectedMuscleGroup as MuscleGroup)) ||
        (exercise.secondary_muscle_groups && Array.isArray(exercise.secondary_muscle_groups) && 
          exercise.secondary_muscle_groups.includes(selectedMuscleGroup as MuscleGroup));

      const matchesEquipment = selectedEquipment === "all" || 
        (exercise.equipment_type && Array.isArray(exercise.equipment_type) && 
          exercise.equipment_type.includes(selectedEquipment as EquipmentType));

      const matchesDifficulty = selectedDifficulty === "all" || 
        exercise.difficulty === selectedDifficulty;

      const matchesMovement = selectedMovement === "all" || 
        exercise.movement_pattern === selectedMovement;

      return matchesSearch && matchesMuscleGroup && matchesEquipment && 
            matchesDifficulty && matchesMovement;
    });
  };

  const filteredBaseExercises = filterExercises(
    Array.isArray(exercises) 
      ? exercises.filter(ex => ex && !ex.base_exercise_id) 
      : []
  );

  const suggestedExercises = filterExercises(
    Array.isArray(exercises) 
      ? exercises.filter(ex => ex && !ex.base_exercise_id).slice(0, 20) 
      : []
  );
  
  const filteredRecent = filterExercises(Array.isArray(recentExercises) ? recentExercises : []);
  const filteredAll = filteredBaseExercises;

  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentBaseExercises = filteredBaseExercises.slice(indexOfFirstExercise, indexOfLastExercise);
  const totalPages = Math.ceil(filteredBaseExercises.length / exercisesPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedMuscleGroup, selectedEquipment, selectedDifficulty, selectedMovement]);

  const handleAdd = () => {
    if (!user || !user.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create exercises",
        variant: "destructive"
      });
      return;
    }
    
    setExerciseToEdit(null);
    setBaseExerciseForVariation(null);
    setDialogMode("add");
    setShowDialog(true);
  };

  const handleEdit = (exercise: Exercise) => {
    if (!user || !user.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to edit exercises",
        variant: "destructive"
      });
      return;
    }
    
    setExerciseToEdit(exercise);
    setBaseExerciseForVariation(null);
    setDialogMode("edit");
    setShowDialog(true);
  };
  
  const handleAddVariation = (baseExercise: Exercise) => {
    if (!user || !user.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create exercise variations",
        variant: "destructive"
      });
      return;
    }
    
    setExerciseToEdit(null);
    setBaseExerciseForVariation(baseExercise);
    setDialogMode("add");
    setShowDialog(true);
  };
  
  const handleDelete = (exercise: Exercise) => {
    if (!user || !user.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to delete exercises",
        variant: "destructive"
      });
      return;
    }
    
    setExerciseToDelete(exercise);
    setDeleteConfirmOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!exerciseToDelete) return;
    
    try {
      await deleteExercise(exerciseToDelete.id);
      toast({
        title: "Exercise deleted",
        description: `${exerciseToDelete.name} has been removed from your library`,
      });
    } catch (err) {
      console.error("Error deleting exercise:", err);
      toast({
        title: "Failed to delete exercise",
        description: "An error occurred while deleting the exercise",
        variant: "destructive"
      });
    }
    
    setDeleteConfirmOpen(false);
    setExerciseToDelete(null);
  };
  
  const handleSelectExercise = (exercise: Exercise) => {
    if (onSelectExercise) {
      onSelectExercise(exercise);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedMuscleGroup("all");
    setSelectedEquipment("all");
    setSelectedDifficulty("all");
    setSelectedMovement("all");
  };

  const handleDialogSubmit = async (exercise: {
    name: string;
    description: string;
    primary_muscle_groups: MuscleGroup[];
    secondary_muscle_groups: MuscleGroup[];
    equipment_type: string[];
    movement_pattern: MovementPattern;
    difficulty: Difficulty;
    instructions?: { steps: string[] };
    is_compound?: boolean;
    tips?: string[];
    variations?: string[];
    metadata?: Record<string, any>;
    is_bodyweight?: boolean;
    energy_cost_factor?: number;
    base_exercise_id?: string;
    variation_type?: string;
    variation_value?: string;
    variationList?: any[];
  }) => {
    if (!user || !user.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save exercises",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (dialogMode === "add") {
        await new Promise(resolve => setTimeout(resolve, 350));
        await new Promise<void>((resolve, reject) => {
          const instructionsWithSteps = {
            steps: Array.isArray(exercise.instructions?.steps) 
              ? exercise.instructions.steps 
              : (exercise.instructions?.steps ? [exercise.instructions.steps] : [])
          };
          
          createExercise(
            {
              ...exercise,
              user_id: user.id,
              is_compound: exercise.is_compound ?? false,
              difficulty: exercise.difficulty || 'intermediate',
              instructions: instructionsWithSteps,
              primary_muscle_groups: (Array.isArray(exercise.primary_muscle_groups) ? exercise.primary_muscle_groups : []) as MuscleGroup[],
              secondary_muscle_groups: (Array.isArray(exercise.secondary_muscle_groups) ? exercise.secondary_muscle_groups : []) as MuscleGroup[],
              equipment_type: (Array.isArray(exercise.equipment_type) ? exercise.equipment_type : []) as EquipmentType[]
            },
            {
              onSuccess: () => resolve(),
              onError: err => reject(err),
            }
          );
        });
        
        toast({
          title: baseExerciseForVariation ? "Variation added" : "Exercise added",
          description: baseExerciseForVariation 
            ? `Added variation to ${baseExerciseForVariation.name}`
            : `Added ${exercise.name} to your library`
        });
        
        setShowDialog(false);
      } else if (dialogMode === "edit" && exerciseToEdit) {
        const instructionsWithSteps = {
          steps: Array.isArray(exercise.instructions?.steps) 
            ? exercise.instructions.steps 
            : (exercise.instructions?.steps ? [exercise.instructions.steps] : [])
        };
        
        await updateExercise({
          id: exerciseToEdit.id,
          ...exercise,
          user_id: user.id,
          is_compound: exercise.is_compound ?? false,
          difficulty: exercise.difficulty || 'intermediate',
          instructions: instructionsWithSteps,
          primary_muscle_groups: (Array.isArray(exercise.primary_muscle_groups) ? exercise.primary_muscle_groups : []) as MuscleGroup[],
          secondary_muscle_groups: (Array.isArray(exercise.secondary_muscle_groups) ? exercise.secondary_muscle_groups : []) as MuscleGroup[],
          equipment_type: (Array.isArray(exercise.equipment_type) ? exercise.equipment_type : []) as EquipmentType[]
        });
        
        toast({
          title: "Exercise updated",
          description: `Updated ${exercise.name} in your library`
        });
        
        setShowDialog(false);
      }
    } catch (error) {
      console.error("Error handling exercise submission:", error);
      toast({
        title: "Error",
        description: "Failed to save exercise. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderExerciseVariationGroup = (exercise: Exercise) => {
    if (!exercise) return null;
    
    return (
      <div key={exercise.id} className="mb-4">
        <ExerciseVariationGroup
          baseExercise={exercise}
          onSelect={standalone ? undefined : handleSelectExercise}
          onEdit={standalone ? handleEdit : undefined}
          onDelete={standalone ? handleDelete : undefined}
          onAddVariation={standalone ? handleAddVariation : undefined}
        />
      </div>
    );
  };

  const renderExerciseList = (exercisesList: Exercise[], showPagination = false) => {
    if (!exercisesList || !Array.isArray(exercisesList) || exercisesList.length === 0) {
      return (
        <div className="text-center py-6 text-gray-400">
          No exercises found
        </div>
      );
    }

    const listToRender = showPagination ? currentBaseExercises : exercisesList;
    
    if (!Array.isArray(listToRender)) {
      console.error("Expected array but got:", listToRender);
      return (
        <div className="text-center py-6 text-gray-400">
          Error rendering exercises
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {(listToRender || []).map(exercise => 
          exercise ? renderExerciseVariationGroup(exercise) : null
        )}
        
        {showPagination && totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => paginate(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {currentPage > 2 && (
                <PaginationItem>
                  <PaginationLink onClick={() => paginate(1)}>1</PaginationLink>
                </PaginationItem>
              )}
              
              {currentPage > 3 && (
                <PaginationItem>
                  <span className="px-2">...</span>
                </PaginationItem>
              )}
              
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationLink onClick={() => paginate(currentPage - 1)}>
                    {currentPage - 1}
                  </PaginationLink>
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationLink isActive>{currentPage}</PaginationLink>
              </PaginationItem>
              
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationLink onClick={() => paginate(currentPage + 1)}>
                    {currentPage + 1}
                  </PaginationLink>
                </PaginationItem>
              )}
              
              {currentPage < totalPages - 2 && (
                <PaginationItem>
                  <span className="px-2">...</span>
                </PaginationItem>
              )}
              
              {currentPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationLink onClick={() => paginate(totalPages)}>
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => paginate(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`${standalone ? 'pt-16 pb-24' : ''} h-full overflow-hidden flex flex-col`}>
        {standalone && <PageHeader title="Exercise Library" />}
        <div className={`flex-1 overflow-auto mx-auto w-full max-w-4xl px-4 ${standalone ? 'py-4' : 'pt-0'}`}>
          <div className="space-y-4 pt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-3">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {standalone ? (
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            Exercise Library
          </h1>
          <Button variant="outline" className="gap-2" asChild>
            <a href="/enhanced-exercises">
              <Sparkles className="h-4 w-4" />
              Enhanced Editor
            </a>
          </Button>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Exercise Library</h1>
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
        </div>
      )}

      <div className={`flex-1 overflow-hidden flex flex-col mx-auto w-full max-w-4xl px-4 ${standalone ? 'py-4' : 'pt-0'}`}>
        <ExerciseDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          onSubmit={handleDialogSubmit}
          initialExercise={exerciseToEdit}
          baseExercise={baseExerciseForVariation}
          loading={isPending}
          mode={dialogMode}
        />
        
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{exerciseToDelete?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <div className="flex items-center justify-between mb-4">
          {onBack && (
            <Button 
              variant="ghost"
              size="sm" 
              onClick={onBack}
              className="flex items-center gap-2 -ml-2"
            >
              <ChevronLeft size={18} />
              Back
            </Button>
          )}
          
          <div className="flex-1 flex justify-center">
            <h1 className="text-xl font-semibold text-center">
              {standalone ? "Exercise Library" : "Browse Exercises"}
            </h1>
          </div>
          
          {standalone && (
            <Button 
              onClick={handleAdd}
              size="sm"
              variant="outline"
              className="h-9 px-3 rounded-full bg-purple-900/30 border-purple-500/30 hover:bg-purple-800/50"
            >
              <Plus size={16} className="mr-1" />
              New Exercise
            </Button>
          )}
        </div>
        
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
                
        <Tabs className="flex-1 overflow-hidden flex flex-col" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="suggested">Suggested</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="browse">Browse All</TabsTrigger>
          </TabsList>
          
          {activeTab === 'browse' && (
            <div className="mb-4">
              <Button 
                variant="outline"
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center w-full justify-center ${showFilters ? 'bg-purple-900/50 border-purple-500' : ''}`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {(selectedMuscleGroup !== "all" || selectedEquipment !== "all" || 
                  selectedDifficulty !== "all" || selectedMovement !== "all") && (
                  <Badge variant="secondary" className="ml-2 bg-purple-600 text-xs">
                    {[
                      selectedMuscleGroup !== "all" ? 1 : 0,
                      selectedEquipment !== "all" ? 1 : 0,
                      selectedDifficulty !== "all" ? 1 : 0,
                      selectedMovement !== "all" ? 1 : 0
                    ].reduce((a, b) => a + b, 0)}
                  </Badge>
                )}
              </Button>
            </div>
          )}
          
          {showFilters && activeTab === 'browse' && (
            <Card className="p-4 mb-4 bg-gray-800/50 border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Muscle Group</label>
                  <Select 
                    value={selectedMuscleGroup} 
                    onValueChange={(value) => setSelectedMuscleGroup(value as any)}
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-700">
                      <SelectValue placeholder="Select muscle group" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectGroup>
                        <SelectItem value="all">All Muscle Groups</SelectItem>
                        {COMMON_MUSCLE_GROUPS.map((muscle) => (
                          <SelectItem key={muscle} value={muscle}>{muscle}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Equipment</label>
                  <Select 
                    value={selectedEquipment} 
                    onValueChange={(value) => setSelectedEquipment(value as any)}
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-700">
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectGroup>
                        <SelectItem value="all">All Equipment</SelectItem>
                        {COMMON_EQUIPMENT.map((equipment) => (
                          <SelectItem key={equipment} value={equipment}>{equipment}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Difficulty</label>
                  <Select 
                    value={selectedDifficulty} 
                    onValueChange={(value) => setSelectedDifficulty(value as any)}
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-700">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectGroup>
                        <SelectItem value="all">All Difficulties</SelectItem>
                        {DIFFICULTY_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Movement Pattern</label>
                  <Select 
                    value={selectedMovement} 
                    onValueChange={(value) => setSelectedMovement(value as any)}
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-700">
                      <SelectValue placeholder="Select movement" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectGroup>
                        <SelectItem value="all">All Movements</SelectItem>
                        {MOVEMENT_PATTERNS.map((pattern) => (
                          <SelectItem key={pattern} value={pattern}>{pattern}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </Card>
          )}
          
          <ScrollArea className="flex-1 overflow-auto">
            <TabsContent value="suggested" className="mt-0">
              {renderExerciseList(suggestedExercises)}
            </TabsContent>
            
            <TabsContent value="recent" className="mt-0">
              {renderExerciseList(filteredRecent)}
            </TabsContent>
            
            <TabsContent value="browse" className="mt-0">
              {renderExerciseList(filteredAll, true)}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
      
      {standalone && isMobile && (
        <ExerciseFAB onClick={handleAdd} />
      )}
    </div>
  );
}
