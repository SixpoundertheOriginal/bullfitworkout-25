
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TrainingTypeStep } from './wizard-steps/TrainingTypeStep';
import { FocusAndDurationStep } from './wizard-steps/FocusAndDurationStep';
import { ReviewAndStartStep } from './wizard-steps/ReviewAndStartStep';
import { WizardProgressBar } from './wizard-steps/WizardProgressBar';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { useWorkoutStats } from '@/hooks/useWorkoutStats';
import { cn } from '@/lib/utils';
import QuickStartOption from './wizard-steps/QuickStartOption';

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
}

export function ExerciseSetupWizard({ onComplete, onCancel }: ExerciseSetupWizardProps) {
  const [step, setStep] = useState(0);
  const [showQuickStart, setShowQuickStart] = useState(true);
  const { stats } = useWorkoutStats();
  
  // Training config state
  const [trainingType, setTrainingType] = useState(stats?.recommendedType?.toLowerCase() || 'strength');
  const [bodyFocus, setBodyFocus] = useState<string[]>([]);
  const [duration, setDuration] = useState(stats?.recommendedDuration || 45);
  const [tags, setTags] = useState<string[]>([]);

  // Calculate expected XP based on duration and other factors
  const expectedXp = Math.round(duration * 2);
  
  // Configure touch gestures for swipe navigation
  const { ref: touchRef } = useTouchGestures({
    onSwipeLeft: () => {
      if (step < 2 && !showQuickStart) {
        setStep(step + 1);
      }
    },
    onSwipeRight: () => {
      if (step > 0) {
        setStep(step - 1);
      }
    },
    threshold: 50,
  });

  // Start with quick start if first time or special condition
  useEffect(() => {
    const hasUsedSetupBefore = localStorage.getItem('has_used_setup');
    if (!hasUsedSetupBefore) {
      setShowQuickStart(true);
      localStorage.setItem('has_used_setup', 'true');
    } else {
      setShowQuickStart(false);
    }
  }, []);

  // Prepare the configuration object to pass to the parent
  const handleComplete = () => {
    const config: TrainingConfig = {
      trainingType,
      bodyFocus,
      duration,
      tags,
      expectedXp
    };
    
    onComplete(config);
  };

  // Skip the quick start screen
  const handleSkipQuickStart = () => {
    setShowQuickStart(false);
  };

  // Use a quick start option
  const handleQuickStart = (config: Partial<TrainingConfig>) => {
    const fullConfig = {
      trainingType: config.trainingType || trainingType,
      bodyFocus: config.bodyFocus || [],
      duration: config.duration || duration,
      tags: config.tags || [],
      expectedXp: Math.round((config.duration || duration) * 2)
    };
    
    onComplete(fullConfig);
  };
  
  // Navigate to previous step
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };
  
  // Navigate to next step
  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

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
          onSelectType={setTrainingType} 
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
  
  return (
    <div 
      className="flex flex-col h-full w-full bg-gray-900 text-white"
      ref={touchRef}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400"
            onClick={handleBack}
          >
            <ChevronLeft className="mr-1 h-5 w-5" />
            {getBackButtonLabel()}
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
          
          {/* Spacer to center the title */}
          <div className="w-16" />
        </div>
        
        {!showQuickStart && (
          <WizardProgressBar 
            currentStep={step} 
            totalSteps={3} 
          />
        )}
      </div>
      
      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        {renderStepContent()}
      </div>
      
      {/* Footer - Fixed at bottom */}
      {!showQuickStart && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-800">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              className="border-gray-700"
            >
              {getBackButtonLabel()}
            </Button>
            
            <Button 
              onClick={handleNext}
              className={cn(
                "bg-gradient-to-r from-purple-600 to-pink-500",
                "hover:from-purple-700 hover:to-pink-600"
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
