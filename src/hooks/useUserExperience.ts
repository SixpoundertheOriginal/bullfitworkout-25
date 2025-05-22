
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface ExperienceData {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  totalXp: number;
  trainingTypeLevels?: Record<string, { 
    level: number; 
    xp: number; 
    nextLevelXp: number;
  }>;
}

// Helper function to calculate level from XP
const calculateLevel = (xp: number): { level: number; currentXp: number; nextLevelXp: number } => {
  // Simple exponential level formula: nextLevel = baseXP * level^1.5
  const baseXP = 100;
  let level = 1;
  let levelXp = baseXP;
  
  while (xp >= levelXp) {
    level++;
    levelXp += Math.floor(baseXP * Math.pow(level, 1.5));
  }
  
  // Calculate XP needed for next level
  const nextLevelXp = Math.floor(baseXP * Math.pow(level + 1, 1.5));
  
  // Calculate current XP within this level
  const prevLevelTotalXp = levelXp - Math.floor(baseXP * Math.pow(level, 1.5));
  const currentXp = xp - prevLevelTotalXp;
  
  return { level, currentXp, nextLevelXp };
};

export const useUserExperience = () => {
  const { user } = useAuth();
  const [experienceData, setExperienceData] = useState<ExperienceData>({
    level: 1,
    currentXp: 0,
    nextLevelXp: 100,
    totalXp: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchExperienceData = async () => {
      setLoading(true);
      
      try {
        // Fetch user profile with experience data
        const { data, error } = await supabase
          .from('user_profiles')
          .select('training_experience')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data?.training_experience) {
          const exp = data.training_experience;
          const totalXp = exp.totalXp || 0;
          
          // Calculate level based on total XP
          const levelData = calculateLevel(totalXp);
          
          // Process training type levels
          const trainingTypeLevels: Record<string, any> = {};
          if (exp.trainingTypeLevels) {
            Object.entries(exp.trainingTypeLevels).forEach(([type, data]: [string, any]) => {
              const typeXp = data.xp || 0;
              const typeLevelData = calculateLevel(typeXp);
              trainingTypeLevels[type] = {
                ...typeLevelData,
                xp: typeXp
              };
            });
          }
          
          setExperienceData({
            ...levelData,
            totalXp,
            trainingTypeLevels
          });
        } else {
          // Default values if no experience data
          setExperienceData({
            level: 1,
            currentXp: 0,
            nextLevelXp: 100,
            totalXp: 0
          });
        }
      } catch (error) {
        console.error('Error fetching experience data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExperienceData();
  }, [user]);
  
  return { experienceData, loading };
};
