
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Exercise } from '@/types/exercise';

export interface TrainingConfig {
  trainingType: string;
  tags: string[];
  duration: number;
  bodyFocus?: string[];
  timeOfDay?: string;
  intensity?: number;
  rankedExercises?: {
    recommended: Exercise[];
    other: Exercise[];
    matchData: Record<string, { score: number, reasons: string[] }>;
  };
  lastUpdated?: string;
  quickStart?: boolean;
}

const STORAGE_KEY = 'training_setup_';
const CONFIG_EXPIRY_HOURS = 48; // Configuration now expires after 48 hours

export function useTrainingSetupPersistence() {
  const [storedConfig, setStoredConfig] = useState<TrainingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load stored config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }
        
        const key = `${STORAGE_KEY}${user.id}`;
        const savedConfig = localStorage.getItem(key);
        
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig);
          // Check if config is older than the expiry time
          const timestamp = new Date(parsed.lastUpdated || 0);
          const isExpired = (new Date().getTime() - timestamp.getTime()) > CONFIG_EXPIRY_HOURS * 60 * 60 * 1000;
          
          if (isExpired) {
            console.log('Training config expired, removing');
            localStorage.removeItem(key);
          } else {
            console.log('Using stored training config from', timestamp);
            setStoredConfig(parsed);
          }
        } else {
          console.log('No stored training config found');
        }
      } catch (error) {
        console.error("Error loading training configuration:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConfig();
  }, []);
  
  // Save config to localStorage
  const saveConfig = async (config: TrainingConfig) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const key = `${STORAGE_KEY}${user.id}`;
      const configWithTimestamp = {
        ...config,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(key, JSON.stringify(configWithTimestamp));
      setStoredConfig(configWithTimestamp);
      console.log('Saved training config to localStorage');
      return configWithTimestamp;
    } catch (error) {
      console.error("Error saving training configuration:", error);
      return null;
    }
  };
  
  // Get time since last configuration update in hours
  const getTimeSinceLastConfig = () => {
    if (!storedConfig?.lastUpdated) return null;
    
    const lastUpdated = new Date(storedConfig.lastUpdated);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
    return hoursDiff;
  };
  
  // Check if config was recently updated (within 48 hours)
  const isConfigRecent = () => {
    const hoursSince = getTimeSinceLastConfig();
    return hoursSince !== null && hoursSince < CONFIG_EXPIRY_HOURS;
  };
  
  // Clear stored config
  const clearConfig = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const key = `${STORAGE_KEY}${user.id}`;
      localStorage.removeItem(key);
      setStoredConfig(null);
    } catch (error) {
      console.error("Error clearing training configuration:", error);
    }
  };
  
  return {
    storedConfig,
    isLoading,
    saveConfig,
    clearConfig,
    isConfigRecent,
    getTimeSinceLastConfig
  };
}
