
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: "award" | "star" | "target" | "trophy" | "calendar" | "flame";
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export const useUserAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchAchievements = async () => {
      setLoading(true);
      
      try {
        // Fetch workout count for achievements
        const { data: workouts, error } = await supabase
          .from("workout_sessions")
          .select("id")
          .eq("user_id", user.id);
          
        const workoutCount = workouts?.length || 0;
        
        // Since we don't have a dedicated achievements table yet,
        // we'll generate achievements based on workout data
        const generatedAchievements: Achievement[] = [
          {
            id: "first-workout",
            name: "First Workout",
            description: "Complete your first workout",
            icon: "trophy",
            unlocked: workoutCount >= 1,
          },
          {
            id: "workout-streak",
            name: "Getting Started",
            description: "Complete 5 workouts",
            icon: "flame",
            unlocked: workoutCount >= 5,
            progress: Math.min(workoutCount, 5),
            maxProgress: 5
          },
          {
            id: "regular",
            name: "Regular",
            description: "Complete 10 workouts",
            icon: "calendar",
            unlocked: workoutCount >= 10,
            progress: Math.min(workoutCount, 10),
            maxProgress: 10
          },
          {
            id: "dedicated",
            name: "Dedicated",
            description: "Complete 25 workouts",
            icon: "target",
            unlocked: workoutCount >= 25,
            progress: Math.min(workoutCount, 25),
            maxProgress: 25
          },
          {
            id: "fitness-enthusiast",
            name: "Fitness Enthusiast",
            description: "Complete 50 workouts",
            icon: "award",
            unlocked: workoutCount >= 50,
            progress: Math.min(workoutCount, 50),
            maxProgress: 50
          },
          {
            id: "fitness-master",
            name: "Fitness Master",
            description: "Complete 100 workouts",
            icon: "star",
            unlocked: workoutCount >= 100,
            progress: Math.min(workoutCount, 100),
            maxProgress: 100
          }
        ];
        
        setAchievements(generatedAchievements);
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAchievements();
  }, [user]);
  
  return { achievements, loading };
};
