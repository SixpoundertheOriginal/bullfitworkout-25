import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Json } from "@/integrations/supabase/types";
import { standardizeTrainingType } from "@/utils/trainingTypeUtils";

// Utility to ensure safe conversion for arithmetic, with fallback to 0
const toSafeNumber = (value: unknown): number => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value))) return Number(value);
  return 0;
};

export interface ExperienceData {
  totalXp: number;
  level: number;
  currentLevelXp: number;
  nextLevelThreshold: number;
  progress: number;
  trainingTypeLevels: {
    [key: string]: {
      level: number;
      xp: number;
      progress: number;
    }
  };
}

interface TrainingTypeLevel {
  xp: number;
  level?: number;
  progress?: number;
}

interface TrainingExperience {
  totalXp: number;
  trainingTypeLevels: {
    [key: string]: TrainingTypeLevel;
  };
}

interface UserProfileWithExperience {
  id: string;
  training_experience?: TrainingExperience;
}

// New interface for the return value of addExperienceAsync
export interface ExperienceAddResult {
  addedXp: number;
  newTotalXp: number;
  trainingType: string | null;
  previousLevel?: number;
  newLevel?: number;
}

export const calculateLevelRequirement = (level: number): number => {
  return Math.round(100 * Math.pow(level, 1.5));
};

export const calculateLevelFromXP = (totalXp: number): { level: number; progress: number } => {
  let level = 0;
  let remainingXp = totalXp;
  let levelThreshold = calculateLevelRequirement(1);

  while (remainingXp >= levelThreshold) {
    level++;
    remainingXp -= levelThreshold;
    levelThreshold = calculateLevelRequirement(level + 1);
  }

  const progress = (levelThreshold > 0) ? (remainingXp / levelThreshold * 100) : 0;

  return { 
    level: Math.max(1, level),
    progress
  };
};

export function useExperiencePoints() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['experience', user?.id],
    queryFn: async (): Promise<ExperienceData> => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user experience:", profileError);
          throw profileError;
        }

        const defaultExpData: ExperienceData = {
          totalXp: 0,
          level: 1,
          currentLevelXp: 0,
          nextLevelThreshold: calculateLevelRequirement(1),
          progress: 0,
          trainingTypeLevels: {
            "Strength": { level: 1, xp: 0, progress: 0 },
            "Cardio": { level: 1, xp: 0, progress: 0 },
            "Yoga": { level: 1, xp: 0, progress: 0 },
            "Calisthenics": { level: 1, xp: 0, progress: 0 },
            "Hypertrophy": { level: 1, xp: 0, progress: 0 },
            "Stretching": { level: 1, xp: 0, progress: 0 }
          }
        };

        if (!profileData || !profileData.training_experience) {
          return defaultExpData;
        }

        const trainingExperienceData = profileData.training_experience as unknown as TrainingExperience;

        const totalXp = toSafeNumber(trainingExperienceData.totalXp);

        const { level, progress } = calculateLevelFromXP(totalXp);
        
        // Fix: Explicitly type the reduce function to return a number
        const previousLevelsXp = Array.from({ length: level - 1 }).reduce<number>((sum, _, i) =>
          sum + calculateLevelRequirement(i + 1), 0);

        const currentLevelXp = totalXp - previousLevelsXp;
        const nextLevelThreshold = calculateLevelRequirement(level + 1);

        // Defensive: ensure all type XPs are numbers
        const rawTrainingTypeLevels = trainingExperienceData.trainingTypeLevels || {
          "Strength": { xp: 0 },
          "Cardio": { xp: 0 },
          "Yoga": { xp: 0 },
          "Calisthenics": { xp: 0 },
          "Hypertrophy": { xp: 0 },
          "Stretching": { xp: 0 }
        };

        const processedTrainingTypes: ExperienceData['trainingTypeLevels'] = {};
        
        // Process each training type and standardize the names
        Object.entries(rawTrainingTypeLevels).forEach(([key, value]) => {
          // Standardize the training type name
          const standardizedKey = standardizeTrainingType(key) || key;
          const typeXp = toSafeNumber(value.xp);
          const levelData = calculateLevelFromXP(typeXp);

          processedTrainingTypes[standardizedKey] = {
            xp: typeXp,
            level: levelData.level,
            progress: levelData.progress
          };
        });

        return {
          totalXp,
          level,
          currentLevelXp,
          nextLevelThreshold,
          progress,
          trainingTypeLevels: processedTrainingTypes
        };
      } catch (error) {
        console.error("Error in experience query:", error);
        return {
          totalXp: 0,
          level: 1,
          currentLevelXp: 0,
          nextLevelThreshold: calculateLevelRequirement(1),
          progress: 0,
          trainingTypeLevels: {
            "Strength": { level: 1, xp: 0, progress: 0 },
            "Cardio": { level: 1, xp: 0, progress: 0 },
            "Yoga": { level: 1, xp: 0, progress: 0 },
            "Calisthenics": { level: 1, xp: 0, progress: 0 },
            "Hypertrophy": { level: 1, xp: 0, progress: 0 },
            "Stretching": { level: 1, xp: 0, progress: 0 }
          }
        };
      }
    },
    enabled: !!user
  });

  const addExperienceMutation = useMutation({
    mutationFn: async ({ 
      xp, 
      trainingType,
      exerciseName 
    }: { 
      xp: number | string; 
      trainingType?: string;
      exerciseName?: string;
    }): Promise<ExperienceAddResult> => {
      if (!user) throw new Error("User not authenticated");

      // Ensure xp is a number at all times
      const xpAmount = toSafeNumber(xp);

      if (isNaN(xpAmount)) {
        throw new Error("Invalid XP amount");
      }

      // Standardize training type
      const standardizedTrainingType = standardizeTrainingType(trainingType);

      const { data: currentData, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const defaultExp: TrainingExperience = {
        totalXp: 0,
        trainingTypeLevels: {
          "Strength": { xp: 0 },
          "Cardio": { xp: 0 },
          "Yoga": { xp: 0 },
          "Calisthenics": { xp: 0 },
          "Hypertrophy": { xp: 0 },
          "Stretching": { xp: 0 }
        }
      };

      // Defensive: ensure all XP values are numbers
      let currentExp: TrainingExperience;
      if (currentData?.training_experience) {
        const teRaw = currentData.training_experience as Record<string, any>;
        currentExp = {
          totalXp: toSafeNumber(teRaw.totalXp),
          trainingTypeLevels: {}
        };
        
        const typeLevels = teRaw.trainingTypeLevels || {};
        Object.keys(typeLevels).forEach(type => {
          const standardizedType = standardizeTrainingType(type) || type;
          currentExp.trainingTypeLevels[standardizedType] = {
            xp: toSafeNumber(typeLevels[type]?.xp)
          };
        });
        
        // Make sure all default types exist
        ["Strength", "Cardio", "Yoga", "Calisthenics", "Hypertrophy", "Stretching"].forEach(type => {
          if (!Object.prototype.hasOwnProperty.call(currentExp.trainingTypeLevels, type)) {
            currentExp.trainingTypeLevels[type] = { xp: 0 };
          }
        });
      } else {
        currentExp = defaultExp;
      }

      const currentTotalXp = currentExp.totalXp;
      if (isNaN(currentTotalXp)) {
        throw new Error("Invalid current XP value");
      }

      // Calculate levels before and after XP addition
      const { level: previousLevel } = calculateLevelFromXP(currentTotalXp);
      const newTotalXp = currentTotalXp + xpAmount;
      const { level: newLevel } = calculateLevelFromXP(newTotalXp);
      
      // Copy and update
      const updatedExp: TrainingExperience = JSON.parse(JSON.stringify(currentExp));
      updatedExp.totalXp = newTotalXp;

      if (standardizedTrainingType && updatedExp.trainingTypeLevels) {
        // If this training type doesn't exist yet, create it
        if (!Object.prototype.hasOwnProperty.call(updatedExp.trainingTypeLevels, standardizedTrainingType)) {
          updatedExp.trainingTypeLevels[standardizedTrainingType] = { xp: 0 };
        }
        
        const currentTypeXp = toSafeNumber(updatedExp.trainingTypeLevels[standardizedTrainingType].xp);
        if (isNaN(currentTypeXp)) {
          throw new Error("Invalid training type XP value");
        }
        updatedExp.trainingTypeLevels[standardizedTrainingType].xp = currentTypeXp + xpAmount;
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          training_experience: updatedExp as unknown as Json
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      try {
        // Enhanced logging with exercise name
        const metadata = {
          timestamp: new Date().toISOString(),
          exercise_name: exerciseName || null
        };
        
        const { error: logError } = await supabase
          .from('experience_logs')
          .insert({
            user_id: user.id,
            amount: xpAmount,
            training_type: standardizedTrainingType || null,
            source: exerciseName ? 'exercise_completion' : 'workout_completion',
            metadata
          });

        if (logError) {
          console.error("Error logging experience gain:", logError);
        }
      } catch (logError) {
        console.error("Error logging experience gain:", logError);
      }

      // Return the result with level information
      return {
        addedXp: xpAmount,
        newTotalXp,
        trainingType: standardizedTrainingType,
        previousLevel,
        newLevel
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', user?.id] });
    }
  });

  return {
    experienceData: data,
    isLoading,
    error,
    addExperience: addExperienceMutation.mutate,
    addExperienceAsync: addExperienceMutation.mutateAsync,
    isAddingExperience: addExperienceMutation.isPending
  };
}
