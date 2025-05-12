import React, { useState } from 'react';
import { useExercises } from '@/hooks/useExercises';
import { ExerciseDialogV2 } from '@/components/ExerciseDialogV2';
import { ExerciseCard } from '@/components/exercises/ExerciseCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dumbbell, Filter, Search, Plus, BookOpen, Edit } from 'lucide-react';
import { MuscleGroup, MovementPattern } from '@/types/exercise';
import { MUSCLE_GROUP_CATEGORIES } from '@/constants/exerciseMetadata';
import { useAuth } from '@/hooks/useAuth';

export default function ExerciseEditorPage() {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [selectedMovementPattern, setSelectedMovementPattern] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<any>(null);
  const [baseExercise, setBaseExercise] = useState<any>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});
  
  // Get user and exercises data
  const { user } = useAuth();
  const { 
    exercises, 
    createExercise, 
    updateExercise, 
    deleteExercise,
    getBaseExercises,
    getVariationsForExercise,
    isCreating,
    isUpdating,
    isDeleting 
  } = useExercises();

  // Filter exercises by search term and filters
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = searchTerm === '' || 
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMuscle = selectedMuscleGroup === 'all' || 
      exercise.primary_muscle_groups.includes(selectedMuscleGroup as MuscleGroup) ||
      exercise.secondary_muscle_groups.includes(selectedMuscleGroup as MuscleGroup);
    
    const matchesMovement = selectedMovementPattern === 'all' || 
      exercise.movement_pattern === selectedMovementPattern;
    
    return matchesSearch && matchesMuscle && matchesMovement;
  });

  // Get base exercises (exercises without a parent)
  const baseExercises = getBaseExercises();

  // Handle adding a new exercise
  const handleAddExercise = () => {
    setCurrentExercise(null);
    setBaseExercise(null);
    setDialogMode('add');
    setDialogOpen(true);
  };

  // Handle editing an exercise
  const handleEditExercise = (exercise: any) => {
    setCurrentExercise(exercise);
    setBaseExercise(null);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  // Handle adding a variation
  const handleAddVariation = (exercise: any) => {
    setCurrentExercise(null);
    setBaseExercise(exercise);
    setDialogMode('add');
    setDialogOpen(true);
  };

  // Handle deleting an exercise
  const handleDeleteExercise = (exerciseId: string) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      deleteExercise(exerciseId);
    }
  };

  // Toggle exercise expansion for variations
  const toggleExerciseExpand = (exerciseId: string) => {
    setExpandedExercises(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  // Handle form submission
  const handleFormSubmit = (exerciseData: any) => {
    if (dialogMode === 'add') {
      createExercise({
        ...exerciseData,
        user_id: user?.id
      });
    } else {
      updateExercise({
        id: currentExercise.id,
        ...exerciseData
      });
    }
    setDialogOpen(false);
  };

  return (
    <div className="container max-w-screen-xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-1">
          <Dumbbell className="h-7 w-7 text-purple-500" />
          Exercise Library
        </h1>
        <p className="text-gray-400 max-w-2xl">
          Manage your exercise library, add new exercises, create variations, and organize your training database.
        </p>
      </div>

      {/* Filters and actions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-5 flex items-center relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="md:col-span-3">
          <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
            <SelectTrigger className="gap-1">
              <Filter className="h-4 w-4 mr-1" />
              <SelectValue placeholder="Filter by muscle group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Muscle Groups</SelectItem>
              {MUSCLE_GROUP_CATEGORIES.map(category => (
                <React.Fragment key={category.category}>
                  <SelectItem value={category.category} disabled className="text-xs font-bold text-gray-400">
                    {category.category.toUpperCase()}
                  </SelectItem>
                  {category.muscles.map(muscle => (
                    <SelectItem key={muscle} value={muscle} className="pl-6">
                      {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                    </SelectItem>
                  ))}
                </React.Fragment>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="md:col-span-2">
          <Select value={selectedMovementPattern} onValueChange={setSelectedMovementPattern}>
            <SelectTrigger>
              <SelectValue placeholder="Movement Pattern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patterns</SelectItem>
              <SelectItem value="push">Push</SelectItem>
              <SelectItem value="pull">Pull</SelectItem>
              <SelectItem value="squat">Squat</SelectItem>
              <SelectItem value="hinge">Hinge</SelectItem>
              <SelectItem value="lunge">Lunge</SelectItem>
              <SelectItem value="rotation">Rotation</SelectItem>
              <SelectItem value="carry">Carry</SelectItem>
              <SelectItem value="isometric">Isometric</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="md:col-span-2">
          <Button onClick={handleAddExercise} className="w-full gap-1">
            <Plus className="h-5 w-5" /> Add Exercise
          </Button>
        </div>
      </div>

      {/* Exercise list */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="mb-4">
          <TabsTrigger value="all" className="gap-1">
            <Dumbbell className="h-4 w-4" /> All Exercises ({exercises.length})
          </TabsTrigger>
          <TabsTrigger value="base" className="gap-1">
            <BookOpen className="h-4 w-4" /> Base Exercises ({baseExercises.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredExercises.length > 0 ? filteredExercises.map(exercise => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onEdit={() => handleEditExercise(exercise)}
                onDelete={() => handleDeleteExercise(exercise.id)}
                onAddVariation={() => handleAddVariation(exercise)}
                expanded={expandedExercises[exercise.id]}
                toggleExpand={() => toggleExerciseExpand(exercise.id)}
              />
            )) : (
              <div className="col-span-3 text-center py-12 text-gray-500">
                <p className="text-lg font-medium mb-2">No exercises found</p>
                <p className="mb-4">Try adjusting your filters or add a new exercise.</p>
                <Button onClick={handleAddExercise} variant="outline">Add Exercise</Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="base" className="space-y-8">
          {baseExercises.length > 0 ? baseExercises.map(exercise => (
            <Card key={exercise.id} className="border-gray-800 bg-gray-900/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-gray-400" />
                  {exercise.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400">Base Exercise</p>
                    {exercise.description && (
                      <p className="text-sm line-clamp-2">{exercise.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAddVariation(exercise)}
                      className="bg-purple-900/20 border-purple-800/30 hover:bg-purple-800/30"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Variation
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditExercise(exercise)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Variations */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-400">Variations</h4>
                  <ScrollArea className="max-h-[300px]">
                    <div className="space-y-2 pr-4">
                      {getVariationsForExercise(exercise.id).map(variation => (
                        <ExerciseCard
                          key={variation.id}
                          exercise={variation}
                          isVariation
                          onEdit={() => handleEditExercise(variation)}
                          onDelete={() => handleDeleteExercise(variation.id)}
                          className="border-purple-800/30"
                        />
                      ))}
                      {getVariationsForExercise(exercise.id).length === 0 && (
                        <div className="text-center py-4 text-gray-500 border border-dashed border-gray-800 rounded-md">
                          No variations added yet.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium mb-2">No base exercises found</p>
              <p className="mb-4">Add your first exercise to get started.</p>
              <Button onClick={handleAddExercise} variant="outline">Add Exercise</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Exercise Dialog */}
      <ExerciseDialogV2
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        baseExercise={baseExercise}
        initialExercise={currentExercise}
        onSubmit={handleFormSubmit}
        loading={isCreating || isUpdating}
      />
    </div>
  );
}
