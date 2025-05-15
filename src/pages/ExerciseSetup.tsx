
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ExerciseSetupWizard } from '@/components/training/ExerciseSetupWizard';
import { toast } from '@/hooks/use-toast';
import { useWorkoutStats } from '@/hooks/useWorkoutStats';
import { motion } from 'framer-motion';

export default function ExerciseSetupPage() {
  const navigate = useNavigate();
  const { stats } = useWorkoutStats();
  
  const handleComplete = (config: any) => {
    toast({
      title: "Workout Created!",
      description: `Starting ${config.trainingType} workout for ${config.duration} minutes`,
    });
    
    navigate('/training-session', { 
      state: { 
        trainingConfig: {
          trainingType: config.trainingType,
          tags: config.tags,
          duration: config.duration,
          bodyFocus: config.bodyFocus,
          rankedExercises: config.recommendedExercises
        }
      } 
    });
  };
  
  return (
    <MainLayout noHeader={true} noFooter={true}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full fixed inset-0 bg-gray-900 overflow-hidden"
      >
        <ExerciseSetupWizard
          onComplete={handleComplete}
          onCancel={() => navigate('/')}
        />
      </motion.div>
    </MainLayout>
  );
}
