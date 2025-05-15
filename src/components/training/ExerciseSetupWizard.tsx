
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkoutStats } from '@/hooks/useWorkoutStats';
import { useWorkoutRecommendations } from '@/hooks/useWorkoutRecommendations';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { TrainingTypeStep } from './wizard-steps/TrainingTypeStep';
import { FocusAndDurationStep } from './wizard-steps/FocusAndDurationStep';
import { ReviewAndStartStep } from './wizard-steps/ReviewAndStartStep';
import { QuickStartOption } from './wizard-steps/QuickStartOption';
import { WizardProgressBar } from './wizard-steps/WizardProgressBar';
import { useExerciseSuggestions } from '@/hooks/useExerciseSuggestions';
import { useTouchGestures } from '@/hooks/useTouchGestures';

type WizardStep = 'training-type' | 'focus-duration' | 'review';

export interface TrainingConfig {
  trainingType: string;
  bodyFocus: string[];
  duration: number;
  tags: string[];
  expectedXp: number;
  recommendedExercises: string[];
}

interface ExerciseSetupWizardProps {
  initialStep?: WizardStep;
  onComplete: (config: TrainingConfig) => void;
  onCancel?: () => void;
  className?: string;
}

export function ExerciseSetupWizard({
  initialStep = 'training-type',
  onComplete,
  onCancel,
  className
}: ExerciseSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep);
  const [config, setConfig] = useState<TrainingConfig>({
    trainingType: '',
    bodyFocus: [],
    duration: 45,
    tags: [],
    expectedXp: 0,
    recommendedExercises: []
  });
  const [hasQuickStartOption, setHasQuickStartOption] = useState(false);
  const [quickStartConfig, setQuickStartConfig] = useState<TrainingConfig | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const navigate = useNavigate();
  const { stats } = useWorkoutStats();
  const { data: recommendations, isLoading: isLoadingRecommendations } = useWorkoutRecommendations();
  const { suggestedExercises } = useExerciseSuggestions(config.trainingType);
  
  // Use our touch gestures hook for swipe navigation
  const { ref } = useTouchGestures({
    onSwipeLeft: () => handleNextStep(),
    onSwipeRight: () => handlePrevStep(),
    threshold: 50
  });

  // Calculate expected XP based on duration and training type
  useEffect(() => {
    const baseXp = config.duration * 2; // 2 XP per minute
    const typeMultiplier = config.trainingType === 'strength' ? 1.2 : 
                          config.trainingType === 'cardio' ? 1.1 : 1.0;
    
    const muscleGroupBonus = config.bodyFocus.length * 5; // 5 XP per muscle group focused
    const expectedXp = Math.round(baseXp * typeMultiplier + muscleGroupBonus);
    
    setConfig(prev => ({ ...prev, expectedXp }));
  }, [config.duration, config.trainingType, config.bodyFocus]);

  // Generate quick start option based on metrics
  useEffect(() => {
    if (stats && recommendations) {
      const timeOfDay = new Date().getHours() < 12 ? 'morning' : 
                       new Date().getHours() < 17 ? 'afternoon' : 'evening';
      
      const quickConfig: TrainingConfig = {
        trainingType: recommendations.trainingType || 'strength',
        bodyFocus: recommendations.suggestedExercises
          .slice(0, 2)
          .map(ex => {
            const exercise = suggestedExercises.find(e => e.name === ex);
            return exercise?.primary_muscle_groups[0] || 'full_body';
          }),
        duration: recommendations.suggestedDuration || 30,
        tags: recommendations.tags || [],
        expectedXp: Math.round((recommendations.suggestedDuration || 30) * 2.5),
        recommendedExercises: recommendations.suggestedExercises || []
      };
      
      setQuickStartConfig(quickConfig);
      setHasQuickStartOption(true);
    }
  }, [stats, recommendations, suggestedExercises]);

  // Update recommended exercises when training type or body focus changes
  useEffect(() => {
    if (config.trainingType && suggestedExercises.length > 0) {
      const filteredExercises = suggestedExercises
        .filter(ex => {
          // Match by body focus if specified
          if (config.bodyFocus.length > 0) {
            return ex.primary_muscle_groups.some(mg => 
              config.bodyFocus.includes(mg)
            );
          }
          return true;
        })
        .slice(0, 5)
        .map(ex => ex.name);
        
      setConfig(prev => ({ 
        ...prev, 
        recommendedExercises: filteredExercises 
      }));
    }
  }, [config.trainingType, config.bodyFocus, suggestedExercises]);

  const handleNextStep = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    if (currentStep === 'training-type') {
      if (!config.trainingType) {
        toast({
          title: "Please select a training type",
          description: "Choose what type of workout you want to do",
          variant: "destructive"
        });
        setIsTransitioning(false);
        return;
      }
      setCurrentStep('focus-duration');
    } 
    else if (currentStep === 'focus-duration') {
      if (config.bodyFocus.length === 0) {
        toast({
          title: "Please select a focus area",
          description: "Choose at least one muscle group to focus on",
          variant: "destructive"
        });
        setIsTransitioning(false);
        return;
      }
      setCurrentStep('review');
    }
    else if (currentStep === 'review') {
      handleComplete();
    }
    
    // Trigger haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(5); // Light haptic pulse
    }
    
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handlePrevStep = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    if (currentStep === 'focus-duration') {
      setCurrentStep('training-type');
    }
    else if (currentStep === 'review') {
      setCurrentStep('focus-duration');
    }
    else if (onCancel) {
      onCancel();
    }
    
    // Trigger haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(5); // Light haptic pulse
    }
    
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleComplete = () => {
    // Trigger success haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 30, 10]); // Success pattern
    }
    
    onComplete(config);
  };
  
  const handleQuickStart = () => {
    if (quickStartConfig) {
      // Trigger success haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 30, 10]); // Success pattern
      }
      
      toast({
        title: "Quick Start Activated!",
        description: `Starting a ${quickStartConfig.trainingType} workout optimized for you`
      });
      
      onComplete(quickStartConfig);
    }
  };

  const updateConfig = (updates: Partial<TrainingConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };
  
  // Determine current step index for progress bar
  const currentStepIndex = 
    currentStep === 'training-type' ? 0 :
    currentStep === 'focus-duration' ? 1 : 2;

  return (
    <div 
      ref={ref}
      className={cn(
        "flex flex-col w-full h-full bg-gray-900 text-white",
        className
      )}
    >
      {/* Header with progress */}
      <div className="sticky top-0 z-10 bg-gray-900 py-4 px-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={handlePrevStep}
            className="p-2 rounded-full hover:bg-gray-800 active:bg-gray-700 transition-colors"
            aria-label="Go back"
          >
            <ChevronRight className="h-5 w-5 transform rotate-180" />
          </button>
          
          <div className="font-semibold text-lg">
            {currentStep === 'training-type' && "Choose Training Type"}
            {currentStep === 'focus-duration' && "Set Focus & Duration"}
            {currentStep === 'review' && "Review & Start"}
          </div>
          
          <div className="w-9" /> {/* Empty space for balance */}
        </div>
        
        <WizardProgressBar currentStep={currentStepIndex} totalSteps={3} />
      </div>
      
      {/* Quick start option */}
      {currentStep === 'training-type' && hasQuickStartOption && quickStartConfig && (
        <QuickStartOption
          config={quickStartConfig}
          onQuickStart={handleQuickStart}
          isLoading={isLoadingRecommendations}
        />
      )}
      
      {/* Main content area with step components */}
      <div className="flex-grow overflow-y-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {currentStep === 'training-type' && (
              <TrainingTypeStep 
                selectedType={config.trainingType}
                onSelectType={(type) => updateConfig({ trainingType: type })}
                stats={stats}
              />
            )}
            
            {currentStep === 'focus-duration' && (
              <FocusAndDurationStep 
                selectedFocus={config.bodyFocus}
                duration={config.duration}
                trainingType={config.trainingType}
                onUpdateFocus={(focus) => updateConfig({ bodyFocus: focus })}
                onUpdateDuration={(duration) => updateConfig({ duration })}
                onUpdateTags={(tags) => updateConfig({ tags })}
              />
            )}
            
            {currentStep === 'review' && (
              <ReviewAndStartStep 
                config={config}
                stats={stats}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Footer with navigation */}
      <div className="sticky bottom-0 z-10 bg-gray-900 px-4 py-4 border-t border-gray-800">
        <Button
          onClick={handleNextStep}
          className={cn(
            "w-full h-14 text-base font-semibold rounded-xl",
            "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600",
            "flex items-center justify-center gap-2 transform transition-all",
            "active:scale-[0.98] shadow-lg hover:shadow-purple-500/25"
          )}
          disabled={isTransitioning}
        >
          {currentStep === 'review' ? (
            <>Start Workout • {config.expectedXp} XP</>
          ) : (
            <>Continue</>
          )}
        </Button>
      </div>
    </div>
  );
}
