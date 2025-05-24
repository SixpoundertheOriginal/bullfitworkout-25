
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ExerciseSetupWizard } from '@/components/training/ExerciseSetupWizard';
import { toast } from '@/hooks/use-toast';
import { useWorkoutStats } from '@/hooks/useWorkoutStats';
import { motion } from 'framer-motion';
import { useWorkoutStore } from '@/store/workout';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default function ExerciseSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { stats, loading: isLoadingStats } = useWorkoutStats();
  const { isActive, lastActiveRoute, resetSession } = useWorkoutStore();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Handle location state for errors
  useEffect(() => {
    if (location.state?.errorReason) {
      setShowError(true);
      switch (location.state.errorReason) {
        case 'invalidState':
          setErrorMessage('Your previous workout session was reset due to invalid state. Please set up a new workout.');
          break;
        case 'noActiveWorkout':
          setErrorMessage('You need to set up a workout before entering training mode.');
          break;
        default:
          setErrorMessage('There was an issue with your workout session. Please set up a new workout.');
      }
      
      // Clear location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  // Check for active session
  useEffect(() => {
    if (isActive && lastActiveRoute) {
      toast({
        title: "Workout in progress",
        description: "You have an active workout. Resume it or reset to start a new one.",
      });
    }
  }, [isActive, lastActiveRoute]);
  
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
  
  const handleResumeWorkout = () => {
    if (isActive && lastActiveRoute) {
      navigate(lastActiveRoute);
    }
  };
  
  const handleResetWorkout = () => {
    if (isActive) {
      resetSession();
      toast({
        title: "Workout Reset",
        description: "Previous workout has been reset. You can start a new one now.",
      });
    }
  };
  
  return (
    <MainLayout noHeader={true} noFooter={true}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full fixed inset-0 bg-gray-900 overflow-hidden"
      >
        {showError && (
          <div className="absolute top-0 left-0 right-0 z-10 p-2">
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertTitle>Attention Required</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          </div>
        )}
        
        {isActive && lastActiveRoute && (
          <div className="absolute top-2 right-2 z-10 p-2">
            <div className="flex gap-2 bg-gray-800/80 p-2 rounded-md border border-gray-700">
              <Button 
                variant="default" 
                size="sm"
                onClick={handleResumeWorkout}
                className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
              >
                Resume Workout
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleResetWorkout}
                className="border-gray-600"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Reset
              </Button>
            </div>
          </div>
        )}
        
        <ExerciseSetupWizard
          onComplete={handleComplete}
          onCancel={() => navigate('/')}
          stats={stats}
          isLoadingStats={isLoadingStats}
        />
      </motion.div>
    </MainLayout>
  );
}
