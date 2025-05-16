
import { ExerciseSet } from '@/types/exercise';

export type ExerciseHistory = {
  sets: ExerciseSet[];
  // The user's rating of the set difficulty on a scale from 1-10
  rpe?: number;
};

export interface SetRecommendation {
  weight: number;
  reps: number;
  restTime: number;
  message?: string;
}

/**
 * Calculates a recommendation for the next set based on current performance and RPE
 */
export function getNextSetRecommendation(
  currentSet: ExerciseSet, 
  rpe: number | undefined,
  exerciseName: string,
  exerciseHistory: ExerciseHistory[] = []
): SetRecommendation {
  // Default to current values
  const recommendation: SetRecommendation = {
    weight: currentSet.weight,
    reps: currentSet.reps,
    restTime: currentSet.restTime || 60,
    message: undefined
  };
  
  // If no RPE provided, return current values
  if (rpe === undefined) {
    return recommendation;
  }
  
  // Get RPE-based adjustments
  const { weightChange, repsChange, restChange, message } = getRpeAdjustments(rpe, currentSet);
  
  // Apply the adjustments
  recommendation.weight = Math.max(0, currentSet.weight + weightChange);
  recommendation.reps = Math.max(1, currentSet.reps + repsChange);
  recommendation.restTime = Math.max(30, (currentSet.restTime || 60) + restChange);
  recommendation.message = message;
  
  return recommendation;
}

/**
 * Calculate adjustments based on RPE (Rate of Perceived Exertion)
 */
function getRpeAdjustments(rpe: number, currentSet: ExerciseSet): { 
  weightChange: number; 
  repsChange: number; 
  restChange: number;
  message: string;
} {
  // Default adjustments
  let weightChange = 0;
  let repsChange = 0;
  let restChange = 0;
  let message = '';
  
  // Adjust based on RPE
  if (rpe <= 3) {
    // Too easy - increase weight or reps
    weightChange = currentSet.weight >= 10 ? 2.5 : 1.25;
    repsChange = 0;
    restChange = -5;
    message = 'Too easy! Increasing weight for optimal challenge.';
  } else if (rpe <= 6) {
    // Moderate - small increase
    weightChange = currentSet.weight >= 20 ? 1.25 : 0.5;
    repsChange = 1;
    restChange = 0;
    message = 'Good intensity! Small progression for continued gains.';
  } else if (rpe <= 8) {
    // Optimal range - maintain
    weightChange = 0;
    repsChange = 0;
    restChange = 0;
    message = 'Perfect intensity! Maintaining for consistent progress.';
  } else {
    // Too hard - decrease weight or reps
    weightChange = -2.5;
    repsChange = -1;
    restChange = 15;
    message = 'Very challenging! Adjusting for better form and recovery.';
  }
  
  return { weightChange, repsChange, restChange, message };
}

/**
 * Generates motivational content based on workout history
 */
export function generateMotivationalContent(
  exerciseName: string,
  currentSet: ExerciseSet,
  exerciseHistory: ExerciseHistory[] = []
): string {
  const messages = [
    `Stay focused! You're doing great with ${exerciseName}!`,
    `Keep pushing! Every rep brings you closer to your goals.`,
    `You've got this! ${currentSet.weight}kg is nothing for you!`,
    `Breathe and focus. Your body is getting stronger with every set.`,
    `Remember your form! Quality reps are more important than quantity.`,
    `You're crushing it! This is how progress happens.`
  ];
  
  // Return a random message
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Calculate total volume lifted in this workout or over time
 */
export function calculateVolumeStats(
  exerciseName: string, 
  sets: ExerciseSet[]
): { 
  currentWorkout: number;
  message: string;
} {
  // Calculate volume (weight × reps) for completed sets
  const completedSets = sets.filter(set => set.completed);
  
  // Calculate total volume
  const totalVolume = completedSets.reduce((sum, set) => {
    return sum + (set.weight * set.reps);
  }, 0);
  
  // Format message
  let message = '';
  if (totalVolume >= 1000) {
    message = `You've lifted over ${(totalVolume/1000).toFixed(1)} tons in this workout!`;
  } else if (totalVolume > 0) {
    message = `You've lifted ${totalVolume.toFixed(0)}kg in this workout!`;
  } else {
    message = 'Track your progress by completing sets!';
  }
  
  return {
    currentWorkout: totalVolume,
    message
  };
}
