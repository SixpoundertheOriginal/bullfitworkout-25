
import React from 'react';
import { useTrainingSession } from '@/hooks/training-session';
import { TrainingSessionContent } from './session/TrainingSessionContent';
import { WorkoutBanner } from './WorkoutBanner';
import { isRecentlyCreatedWorkout } from '@/store/workout/validators';
import { useWorkoutStore } from '@/store/workout';
import { Card, CardContent } from '@/components/ui/card';
import { Dumbbell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const SimplifiedTrainingContent = () => {
  const {
    hasExercises,
    handleFinishWorkout,
    isSaving,
    setIsAddExerciseSheetOpen
  } = useTrainingSession();
  
  const workoutState = useWorkoutStore();
  const { isActive } = workoutState;
  
  // Check if this is a newly created workout
  const isNewlyCreated = isActive && !hasExercises && isRecentlyCreatedWorkout(workoutState);

  const handleOpenAddExercise = () => {
    setIsAddExerciseSheetOpen(true);
  };

  // Show special welcome message for newly created workouts
  if (isNewlyCreated) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <WorkoutBanner />
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center mb-6">
                <Dumbbell className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Workout Started Successfully!
              </h2>
              <p className="text-gray-300 max-w-md mb-8 leading-relaxed">
                Your training session is now active. Add your first exercise to begin tracking your sets, weights, and progress.
              </p>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={handleOpenAddExercise}
                  className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold rounded-full px-8 py-3 shadow-lg shadow-purple-500/25"
                  size="lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Your First Exercise
                </Button>
              </motion.div>
              <p className="text-sm text-gray-500 mt-4">
                Timer is running • Your progress will be automatically saved
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Standard training content for workouts with exercises
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <WorkoutBanner />
      <TrainingSessionContent
        onFinishWorkoutClick={handleFinishWorkout}
        isSaving={isSaving}
        onOpenAddExercise={handleOpenAddExercise}
      />
    </div>
  );
};
