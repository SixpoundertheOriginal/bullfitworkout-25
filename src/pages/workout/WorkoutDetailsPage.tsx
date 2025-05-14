
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkoutDetails } from '@/hooks/useWorkoutDetails';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { ExerciseSet } from '@/types/exercise';
import { AddExerciseSheet } from '@/components/training/AddExerciseSheet';
import { SetRow } from '@/components/SetRow';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { WorkoutDetailsHeader } from '@/components/workouts/WorkoutDetailsHeader';
import { WorkoutSessionFooter } from '@/components/training/WorkoutSessionFooter';
import { TopRestTimer } from '@/components/TopRestTimer';
import { WorkoutStatsOverview } from '@/components/metrics/WorkoutStatsOverview';
import { EmptyWorkoutState } from '@/components/EmptyWorkoutState';
import { toast } from '@/hooks/use-toast';
import { Plus, Dumbbell, BarChart, Clock } from 'lucide-react';

export default function WorkoutDetailsPage() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  
  const [addExerciseSheetOpen, setAddExerciseSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('exercises');
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [resetTimerSignal, setResetTimerSignal] = useState(0);
  
  const { 
    workoutDetails, 
    loading: workoutLoading, 
    error, 
    exerciseSets, 
    addExerciseSet, 
    updateExerciseSet, 
    deleteExerciseSet 
  } = useWorkoutDetails(workoutId);
  
  const { isLoading: isHistoryLoading } = useWorkoutHistory();
  
  const isLoading = workoutLoading || isHistoryLoading;
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading workout",
        description: error,
        variant: "destructive"
      });
      navigate('/');
    }
  }, [error, navigate]);
  
  const handleAddExercise = (exercise: any) => {
    if (!workoutDetails) return;
    
    const exerciseName = typeof exercise === 'string' ? exercise : exercise.name;
    
    // Get the highest set number for this exercise
    const existingSets = exerciseSets[exerciseName] || [];
    
    const nextSetNumber = existingSets.length > 0 
      ? Math.max(...existingSets.map(set => set.set_number)) + 1 
      : 1;
    
    // Create new exercise set with default values
    const newSet: Partial<ExerciseSet> = {
      workout_id: workoutDetails.id,
      exercise_name: exerciseName,
      weight: 0,
      reps: 8,
      set_number: nextSetNumber,
      completed: false,
      restTime: 60,
    };
    
    addExerciseSet(newSet);
  };
  
  const renderExerciseSets = () => {
    if (!workoutDetails || !exerciseSets || Object.keys(exerciseSets).length === 0) {
      return (
        <EmptyWorkoutState 
          onTemplateSelect={handleAddExercise}
          onAddExercise={() => setAddExerciseSheetOpen(true)}
        />
      );
    }
    
    return (
      <div className="space-y-8 pb-24">
        {Object.entries(exerciseSets).map(([exerciseName, sets]) => (
          <Card key={exerciseName} className="overflow-hidden border-gray-800 bg-gray-900/50">
            <div className="p-4 bg-gray-800/50 border-b border-gray-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-purple-500" />
                <span className="font-medium text-lg">{exerciseName}</span>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => {
                  if (sets.length > 0) {
                    const lastSet = sets[sets.length - 1];
                    const newSet = {
                      workout_id: workoutDetails.id,
                      exercise_name: exerciseName,
                      weight: lastSet.weight,
                      reps: lastSet.reps,
                      set_number: lastSet.set_number + 1,
                      completed: false,
                      restTime: lastSet.restTime || 60,
                    };
                    addExerciseSet(newSet);
                  }
                }}
              >
                <Plus size={18} />
              </Button>
            </div>
            <div className="p-0">
              {sets.map((set) => (
                <SetRow
                  key={set.id}
                  exerciseSet={set}
                  onUpdate={updateExerciseSet}
                  onDelete={deleteExerciseSet}
                  onTimerStart={() => {
                    setRestTimerActive(true);
                    setResetTimerSignal(prev => prev + 1);
                  }}
                />
              ))}
            </div>
          </Card>
        ))}
        
        <Button
          className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white"
          onClick={() => setAddExerciseSheetOpen(true)}
        >
          <Plus size={20} /> Add Exercise
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container max-w-screen-md mx-auto py-6 px-4">
        <Skeleton className="h-12 w-3/4 mb-6" />
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }
  
  if (!workoutDetails) {
    return (
      <div className="container max-w-screen-md mx-auto py-6 px-4 text-center">
        <div className="py-16">
          <h2 className="text-2xl font-bold mb-2">Workout not found</h2>
          <p className="text-gray-500 mb-6">The requested workout could not be found.</p>
          <Button onClick={() => navigate('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-20">
      {/* Top Rest Timer */}
      <TopRestTimer 
        isActive={restTimerActive} 
        resetSignal={resetTimerSignal} 
      />
      
      {/* Workout Details Header */}
      <WorkoutDetailsHeader 
        workoutData={workoutDetails} 
      />
      
      {/* Main Content Tabs */}
      <div className="container max-w-screen-md mx-auto px-4 pt-4">
        <Tabs defaultValue="exercises" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="exercises" className="gap-1.5">
              <Dumbbell className="h-4 w-4" /> Exercises
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-1.5">
              <BarChart className="h-4 w-4" /> Stats
            </TabsTrigger>
            <TabsTrigger value="timer" className="gap-1.5">
              <Clock className="h-4 w-4" /> Timer
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="exercises" className="space-y-4">
            {renderExerciseSets()}
          </TabsContent>
          
          <TabsContent value="stats">
            <WorkoutStatsOverview 
              workoutData={workoutDetails} 
            />
          </TabsContent>
          
          <TabsContent value="timer">
            <Card className="border-gray-800">
              <div className="p-6 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                <h3 className="text-xl font-bold mb-2">Rest Timer</h3>
                <p className="text-gray-400 mb-4">
                  Control your rest periods between sets to maximize your workout efficiency.
                </p>
                <Button onClick={() => setActiveTab('exercises')}>
                  Return to Exercises
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Exercise Sheet for Adding Exercises */}
      <AddExerciseSheet
        open={addExerciseSheetOpen}
        onOpenChange={setAddExerciseSheetOpen}
        onSelectExercise={handleAddExercise}
        trainingType={workoutDetails.training_type}
      />
      
      {/* Footer */}
      <WorkoutSessionFooter 
        workoutData={workoutDetails} 
      />
    </div>
  );
}
