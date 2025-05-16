
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { IntelligentMetricsDisplay } from '@/components/metrics/IntelligentMetricsDisplay';
import { ExerciseVolumeChart } from '@/components/metrics/ExerciseVolumeChart';
import { ExerciseSet } from "@/types/exercise";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { useWorkoutStore } from "@/store/workoutStore";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useExperiencePoints } from '@/hooks/useExperiencePoints';
import { showExperienceGain, ExperienceGainOverlay } from '@/components/training/ExperienceGainToast';
import { standardizeTrainingType, getTrainingTypeXpMultiplier } from '@/utils/trainingTypeUtils';
import { motion } from 'framer-motion';
import { Award, Trophy } from 'lucide-react';

// Define a local version of ExerciseSet to match what's used in the workout state
interface LocalExerciseSet {
  weight: number;
  reps: number;
  restTime: number;
  completed: boolean;
  isEditing: boolean;
}

export interface WorkoutCompletionProps {
  exercises: Record<string, LocalExerciseSet[]>;
  duration: number;
  intensity: number;
  efficiency: number;
  onComplete: () => void;
}

export const WorkoutCompletion = ({
  exercises,
  duration,
  intensity,
  efficiency,
  onComplete
}: WorkoutCompletionProps) => {
  const { weightUnit } = useWeightUnit();
  const { resetSession } = useWorkoutStore();
  const navigate = useNavigate();
  const { addExperienceAsync } = useExperiencePoints();
  const [showXpAnimation, setShowXpAnimation] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [trainingType, setTrainingType] = useState<string | undefined>(undefined);
  const [previousLevel, setPreviousLevel] = useState<number | undefined>(undefined);
  const [newLevel, setNewLevel] = useState<number | undefined>(undefined);

  // Convert LocalExerciseSet to ExerciseSet for the chart components
  const convertedExercises = Object.entries(exercises).reduce((acc, [exerciseName, sets]) => {
    acc[exerciseName] = sets.map((set, index) => ({
      id: `temp-${exerciseName}-${index}`,
      weight: set.weight,
      reps: set.reps,
      completed: set.completed,
      set_number: index + 1,
      exercise_name: exerciseName,
      workout_id: 'temp-workout',
      ...(set.restTime !== undefined && { restTime: set.restTime })
    })) as ExerciseSet[];
    return acc;
  }, {} as Record<string, ExerciseSet[]>);
  
  const handleDiscard = () => {
    // Fully terminate the workout session
    resetSession();
    
    // Show confirmation toast
    toast({
      title: "Workout discarded",
      description: "Your workout session has been terminated"
    });
    
    // Navigate to main dashboard
    navigate('/');
  };

  const handleSuccessfulSave = async (workout) => {
    try {
      // Calculate XP based on duration and workout type
      const workoutDuration = workout.duration || 0;
      const workoutTrainingType = standardizeTrainingType(workout.training_type);
      const baseXp = Math.max(10, Math.floor(workoutDuration / 60) * 10); // 10 XP per minute
      const multiplier = getTrainingTypeXpMultiplier(workoutTrainingType);
      const totalXp = Math.round(baseXp * multiplier);
      
      // Save the calculated XP for the animation
      setXpEarned(totalXp);
      setTrainingType(workoutTrainingType || undefined);
      
      // Add the experience
      const result = await addExperienceAsync({
        xp: totalXp,
        trainingType: workoutTrainingType || undefined
      });
      
      // Capture level info if available
      if (result?.previousLevel !== undefined && result?.newLevel !== undefined) {
        setPreviousLevel(result.previousLevel);
        setNewLevel(result.newLevel);
      }
      
      // Show XP animation
      setShowXpAnimation(true);
      
      // Show the experience gain toast as well (as backup)
      showExperienceGain({
        amount: totalXp,
        trainingType: workoutTrainingType || undefined,
        previousLevel: result?.previousLevel,
        newLevel: result?.newLevel
      });
      
      console.log(`Added ${totalXp} XP for ${workoutTrainingType} workout`);
      
      // Continue with existing completion logic after animation finishes
      // The onComplete will be called after the animation completes
    } catch (error) {
      console.error("Error adding experience:", error);
      // Continue with existing completion logic anyway
      onComplete();
    }
  };

  // Handle when XP animation completes
  const handleXpAnimationComplete = () => {
    setShowXpAnimation(false);
    onComplete();
  };

  return (
    <div className="mt-8 flex flex-col items-center">
      <div className="flex w-full justify-between gap-3 mb-4">
        <Button
          variant="outline"
          className="w-1/2 py-3 border-gray-700 hover:bg-gray-800"
          onClick={handleDiscard}
        >
          Discard
        </Button>
        
        <Button
          className="w-1/2 py-3 bg-gradient-to-r from-green-600 to-emerald-500 
            hover:from-green-700 hover:to-emerald-600 text-white font-medium 
            rounded-full shadow-lg hover:shadow-xl"
          onClick={handleSuccessfulSave}
        >
          Complete Workout
        </Button>
      </div>
      
      <IntelligentMetricsDisplay 
        exercises={convertedExercises}
        intensity={intensity}
        efficiency={efficiency}
      />
      
      <div className="mt-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800 w-full">
        <ExerciseVolumeChart 
          exercises={convertedExercises} 
          weightUnit={weightUnit}
        />
      </div>

      {/* XP Gain Animation */}
      {showXpAnimation && (
        <ExperienceGainOverlay 
          amount={xpEarned}
          trainingType={trainingType}
          duration={3000}
          onComplete={handleXpAnimationComplete}
          className="z-50"
        >
          {newLevel && previousLevel && newLevel > previousLevel && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.2, type: "spring" }}
              className="mt-6 flex flex-col items-center"
            >
              <div className="p-4 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 mb-2">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-amber-300">Level Up!</h3>
              <div className="flex items-center gap-3 mt-2">
                <div className="bg-gray-800 p-2 rounded-md text-gray-300">Lvl {previousLevel}</div>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "40px" }}
                  transition={{ delay: 1.5 }}
                  className="h-1 bg-gradient-to-r from-amber-400 to-yellow-600"
                />
                <div className="bg-gradient-to-br from-amber-400 to-yellow-600 p-2 rounded-md text-white font-bold">
                  Lvl {newLevel}
                </div>
              </div>
            </motion.div>
          )}
        </ExperienceGainOverlay>
      )}
    </div>
  );
};

export default WorkoutCompletion;
