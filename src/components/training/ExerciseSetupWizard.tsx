
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
  const [showQuickStart, setShowQuickStart] = useState(false);
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

  // Improved QuickStart logic
  useEffect(() => {
    const hasUsedSetupBefore = localStorage.getItem('has_used_setup');
    console.log('ExerciseSetupWizard: hasUsedSetupBefore:', hasUsedSetupBefore);
    
    // Only show QuickStart for first-time users
    if (!hasUsedSetupBefore) {
      setShowQuickStart(true);
      console.log('ExerciseSetupWizard: First time user, showing QuickStart');
    } else {
      setShowQuickStart(false);
      console.log('ExerciseSetupWizard: Returning user, going directly to wizard');
    }
  }, []);

  // Enhanced debug logging for state changes
  useEffect(() => {
    console.log('ExerciseSetupWizard State Updated:', {
      step,
      showQuickStart,
      trainingType,
      bodyFocus,
      duration,
      shouldShowFooter: !showQuickStart
    });
  }, [step, showQuickStart, trainingType, bodyFocus, duration]);

  // Prepare the configuration object to pass to the parent
  const handleComplete = () => {
    const config: TrainingConfig = {
      trainingType,
      bodyFocus,
      duration,
      tags,
      expectedXp
    };
    
    console.log('ExerciseSetupWizard: Completing with config:', config);
    onComplete(config);
  };

  // Fixed skip QuickStart function
  const handleSkipQuickStart = () => {
    console.log('ExerciseSetupWizard: Skipping QuickStart, entering wizard mode');
    setShowQuickStart(false);
    setStep(0);
    
    // Mark that user has used setup before
    localStorage.setItem('has_used_setup', 'true');
    
    // Force a re-render to ensure the footer appears
    setTimeout(() => {
      console.log('ExerciseSetupWizard: QuickStart transition complete, showQuickStart:', false);
    }, 0);
  };

  // Use a quick start option
  const handleQuickStart = (config: Partial<TrainingConfig>) => {
    console.log('ExerciseSetupWizard: Quick start selected:', config);
    
    const fullConfig = {
      trainingType: config.trainingType || trainingType,
      bodyFocus: config.bodyFocus || [],
      duration: config.duration || duration,
      tags: config.tags || [],
      expectedXp: Math.round((config.duration || duration) * 2)
    };
    
    // Mark that user has used setup before
    localStorage.setItem('has_used_setup', 'true');
    
    onComplete(fullConfig);
  };
  
  // Navigate to previous step
  const handleBack = () => {
    console.log('ExerciseSetupWizard: Back button clicked, current step:', step);
    
    if (step > 0) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };
  
  // Enhanced next handler with better logging
  const handleNext = () => {
    console.log('ExerciseSetupWizard: Next button clicked', {
      currentStep: step,
      trainingType,
      showQuickStart,
      isNextDisabled: isNextDisabled()
    });
    
    if (step < 2) {
      const newStep = step + 1;
      console.log('ExerciseSetupWizard: Advancing to step:', newStep);
      setStep(newStep);
    } else {
      console.log('ExerciseSetupWizard: Final step, completing workout');
      handleComplete();
    }
  };

  // Handle training type selection with debug logging
  const handleTrainingTypeChange = (newType: string) => {
    console.log('ExerciseSetupWizard: Training type changed from', trainingType, 'to', newType);
    setTrainingType(newType);
  };

  // Check if the next button should be disabled
  const isNextDisabled = () => {
    switch (step) {
      case 0:
        const disabled = !trainingType;
        console.log('ExerciseSetupWizard: Next button disabled check (step 0):', disabled, 'trainingType:', trainingType);
        return disabled;
      case 1:
        return false; // Focus and duration step always allows next
      case 2:
        return false; // Review step always allows completion
      default:
        return false;
    }
  };

  // Render the appropriate step content
  const renderStepContent = () => {
    if (showQuickStart) {
      console.log('ExerciseSetupWizard: Rendering QuickStart');
      return (
        <QuickStartOption 
          onSelect={handleQuickStart} 
          onCustomize={handleSkipQuickStart} 
          stats={stats}
        />
      );
    }
    
    console.log('ExerciseSetupWizard: Rendering wizard step:', step);
    
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
  console.log('ExerciseSetupWizard: Footer visibility check:', {
    shouldShowFooter,
    showQuickStart,
    step
  });
  
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
              disabled={isNextDisabled()}
              className={cn(
                "bg-gradient-to-r from-purple-600 to-pink-500",
                "hover:from-purple-700 hover:to-pink-600",
                "flex-1 sm:flex-none",
                isNextDisabled() && "opacity-50 cursor-not-allowed"
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
