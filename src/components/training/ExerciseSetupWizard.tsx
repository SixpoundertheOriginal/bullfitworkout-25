
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TrainingTypeStep } from './wizard-steps/TrainingTypeStep';
import { FocusAndDurationStep } from './wizard-steps/FocusAndDurationStep';
import { ReviewAndStartStep } from './wizard-steps/ReviewAndStartStep';
import { WizardProgressBar } from './wizard-steps/WizardProgressBar';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { cn } from '@/lib/utils';
import QuickStartOption from './wizard-steps/QuickStartOption';
import { WorkoutStats } from '@/types/workoutStats';

export interface TrainingConfig {
  trainingType: string;
  bodyFocus: string[];
  duration: number;
  tags: string[];
  expectedXp?: number;
  recommendedExercises?: any[];
}

interface ExerciseSetupWizardProps {
  onComplete: (config: any) => void;
  onCancel: () => void;
  stats?: WorkoutStats | null;
  isLoadingStats?: boolean;
}

export function ExerciseSetupWizard({ onComplete, onCancel, stats, isLoadingStats }: ExerciseSetupWizardProps) {
  const [step, setStep] = useState(0);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Training config state - initialize with defaults first
  const [trainingType, setTrainingType] = useState('strength');
  const [bodyFocus, setBodyFocus] = useState<string[]>([]);
  const [duration, setDuration] = useState(45);
  const [tags, setTags] = useState<string[]>([]);

  // Initialize training type from stats when available (only once)
  useEffect(() => {
    if (!isInitialized && stats && !isLoadingStats) {
      if (stats.recommendedType) {
        setTrainingType(stats.recommendedType.toLowerCase());
      }
      if (stats.recommendedDuration) {
        setDuration(stats.recommendedDuration);
      }
      setIsInitialized(true);
    }
  }, [stats, isLoadingStats, isInitialized]);

  // Calculate expected XP based on duration
  const expectedXp = useMemo(() => Math.round(duration * 2), [duration]);
  
  // Configure touch gestures for swipe navigation
  const { ref: touchRef } = useTouchGestures({
    onSwipeLeft: useCallback(() => {
      if (step < 2 && !showQuickStart) {
        setStep(prev => prev + 1);
      }
    }, [step, showQuickStart]),
    onSwipeRight: useCallback(() => {
      if (step > 0) {
        setStep(prev => prev - 1);
      }
    }, [step]),
    threshold: 50,
  });

  // QuickStart logic - only run once on mount
  useEffect(() => {
    const hasUsedSetupBefore = localStorage.getItem('has_used_setup');
    
    if (!hasUsedSetupBefore) {
      setShowQuickStart(true);
    }
  }, []);

  // Prepare the configuration object to pass to the parent
  const handleComplete = useCallback(() => {
    const config: TrainingConfig = {
      trainingType,
      bodyFocus,
      duration,
      tags,
      expectedXp
    };
    
    onComplete(config);
  }, [trainingType, bodyFocus, duration, tags, expectedXp, onComplete]);

  // Skip QuickStart function
  const handleSkipQuickStart = useCallback(() => {
    setShowQuickStart(false);
    setStep(0);
    localStorage.setItem('has_used_setup', 'true');
  }, []);

  // Use a quick start option
  const handleQuickStart = useCallback((config: Partial<TrainingConfig>) => {
    const fullConfig = {
      trainingType: config.trainingType || trainingType,
      bodyFocus: config.bodyFocus || [],
      duration: config.duration || duration,
      tags: config.tags || [],
      expectedXp: Math.round((config.duration || duration) * 2)
    };
    
    localStorage.setItem('has_used_setup', 'true');
    onComplete(fullConfig);
  }, [trainingType, duration, onComplete]);
  
  // Navigate to previous step
  const handleBack = useCallback(() => {
    if (step > 0) {
      setStep(prev => prev - 1);
    } else {
      onCancel();
    }
  }, [step, onCancel]);
  
  // Navigate to next step
  const handleNext = useCallback(() => {
    if (step < 2) {
      setStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [step, handleComplete]);

  // Handle training type selection with debouncing to prevent re-render loops
  const handleTrainingTypeChange = useCallback((newType: string) => {
    if (newType !== trainingType) {
      setTrainingType(newType);
    }
  }, [trainingType]);

  // Memoize the next button disabled state to prevent re-calculation on every render
  const isNextDisabled = useMemo(() => {
    switch (step) {
      case 0:
        return !trainingType;
      case 1:
        return false;
      case 2:
        return false;
      default:
        return false;
    }
  }, [step, trainingType]);

  // Show loading state while stats are loading
  if (isLoadingStats) {
    return (
      <div className="flex flex-col h-screen w-full bg-gray-900 text-white relative overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading workout recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render the appropriate step content
  const renderStepContent = () => {
    if (showQuickStart) {
      return (
        <QuickStartOption 
          onSelect={handleQuickStart} 
          onCustomize={handleSkipQuickStart} 
          stats={stats}
        />
      );
    }
    
    switch (step) {
      case 0:
        return <TrainingTypeStep 
          selectedType={trainingType} 
          onSelectType={handleTrainingTypeChange} 
          stats={stats}
        />;
      case 1:
        return <FocusAndDurationStep 
          selectedFocus={bodyFocus}
          duration={duration}
          trainingType={trainingType}
          onUpdateFocus={setBodyFocus}
          onUpdateDuration={setDuration}
          onUpdateTags={setTags}
        />;
      case 2:
        return <ReviewAndStartStep 
          config={{
            trainingType,
            bodyFocus,
            duration,
            tags,
            expectedXp
          }}
          stats={stats}
        />;
      default:
        return null;
    }
  };
  
  // Get the label for the next button based on current step
  const getNextButtonLabel = () => {
    if (step === 2) return 'Start Workout';
    return 'Continue';
  };
  
  // Get back button label
  const getBackButtonLabel = () => {
    if (step === 0) return 'Cancel';
    return 'Back';
  };

  // Footer should be visible when NOT in QuickStart mode
  const shouldShowFooter = !showQuickStart;
  
  return (
    <div 
      className="flex flex-col h-screen w-full bg-gray-900 text-white relative overflow-hidden"
      ref={touchRef}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-800 bg-gray-900 z-10">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400"
            onClick={showQuickStart ? onCancel : handleBack}
          >
            <ChevronLeft className="mr-1 h-5 w-5" />
            {showQuickStart ? 'Cancel' : getBackButtonLabel()}
          </Button>
          
          <h1 className="text-lg font-semibold text-center">
            {showQuickStart 
              ? 'Quick Start' 
              : step === 0 
                ? 'Choose Training Type' 
                : step === 1 
                  ? 'Customize Workout' 
                  : 'Review & Start'
            }
          </h1>
          
          <div className="w-16" />
        </div>
        
        {!showQuickStart && (
          <WizardProgressBar 
            currentStep={step} 
            totalSteps={3} 
          />
        )}
      </div>
      
      {/* Content area - scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {renderStepContent()}
      </div>
      
      {/* Footer - Fixed at bottom - Only show when not in QuickStart mode */}
      {shouldShowFooter && (
        <div className="flex-shrink-0 p-4 bg-gray-900 border-t border-gray-800 z-10">
          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="border-gray-700 flex-1 sm:flex-none"
            >
              {getBackButtonLabel()}
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={isNextDisabled}
              className={cn(
                "bg-gradient-to-r from-purple-600 to-pink-500",
                "hover:from-purple-700 hover:to-pink-600",
                "flex-1 sm:flex-none",
                isNextDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {getNextButtonLabel()}
              {step !== 2 && <ChevronRight className="ml-1 h-5 w-5" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
