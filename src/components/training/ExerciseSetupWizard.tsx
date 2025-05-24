
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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

  // 🚨 ESSENTIAL DEBUG LOGGING
  console.log('🔄 ExerciseSetupWizard RENDER:', {
    step,
    showQuickStart,
    trainingType,
    isInitialized,
    statsLoading: isLoadingStats,
    statsExists: !!stats,
    renderTimestamp: new Date().toISOString()
  });

  // Track state changes
  useEffect(() => {
    console.log('📊 STATE CHANGE DETECTED:', {
      step: `${step} (type: ${typeof step})`,
      trainingType: `"${trainingType}" (type: ${typeof trainingType})`,
      showQuickStart: `${showQuickStart} (type: ${typeof showQuickStart})`,
      timestamp: new Date().toISOString()
    });
  }, [step, trainingType, showQuickStart]);

  // Initialize training type from stats when available (only once)
  useEffect(() => {
    if (!isInitialized && stats && !isLoadingStats) {
      console.log('🎯 Initializing from stats:', {
        recommendedType: stats.recommendedType,
        recommendedDuration: stats.recommendedDuration
      });
      
      if (stats.recommendedType) {
        const newType = stats.recommendedType.toLowerCase();
        console.log('🔄 Setting training type from stats:', newType);
        setTrainingType(newType);
      }
      if (stats.recommendedDuration) {
        console.log('🔄 Setting duration from stats:', stats.recommendedDuration);
        setDuration(stats.recommendedDuration);
      }
      setIsInitialized(true);
    }
  }, [stats, isLoadingStats, isInitialized]);

  // Calculate expected XP based on duration
  const expectedXp = useMemo(() => Math.round(duration * 2), [duration]);
  
  // Use refs to stabilize touch gesture callbacks
  const stepRef = useRef(step);
  const showQuickStartRef = useRef(showQuickStart);
  
  useEffect(() => {
    stepRef.current = step;
    showQuickStartRef.current = showQuickStart;
  }, [step, showQuickStart]);

  // Configure touch gestures for swipe navigation with stable callbacks
  const onSwipeLeft = useCallback(() => {
    console.log('👆 Swipe left detected');
    if (stepRef.current < 2 && !showQuickStartRef.current) {
      console.log('🚀 Advancing step via swipe');
      setStep(prev => prev + 1);
    }
  }, []);

  const onSwipeRight = useCallback(() => {
    console.log('👆 Swipe right detected');
    if (stepRef.current > 0) {
      console.log('🔙 Going back via swipe');
      setStep(prev => prev - 1);
    }
  }, []);

  const { ref: touchRef } = useTouchGestures({
    onSwipeLeft,
    onSwipeRight,
    threshold: 50,
  });

  // QuickStart logic - only run once on mount
  useEffect(() => {
    const hasUsedSetupBefore = localStorage.getItem('has_used_setup');
    console.log('🚀 QuickStart check:', { hasUsedSetupBefore });
    
    if (!hasUsedSetupBefore) {
      setShowQuickStart(true);
    }
  }, []);

  // Prepare the configuration object to pass to the parent
  const handleComplete = useCallback(() => {
    console.log('🏁 COMPLETING WORKOUT');
    const config: TrainingConfig = {
      trainingType,
      bodyFocus,
      duration,
      tags,
      expectedXp
    };
    
    console.log('📋 Final config:', config);
    onComplete(config);
  }, [trainingType, bodyFocus, duration, tags, expectedXp, onComplete]);

  // Skip QuickStart function
  const handleSkipQuickStart = useCallback(() => {
    console.log('⏭️ Skipping QuickStart');
    setShowQuickStart(false);
    setStep(0);
    localStorage.setItem('has_used_setup', 'true');
  }, []);

  // Use a quick start option
  const handleQuickStart = useCallback((config: Partial<TrainingConfig>) => {
    console.log('🚀 Quick start selected:', config);
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
    console.log('🔙 Back button clicked, current step:', step);
    if (step > 0) {
      setStep(prev => {
        console.log('📈 SetStep (back): prev =', prev, 'new =', prev - 1);
        return prev - 1;
      });
    } else {
      console.log('🚪 Canceling workout setup');
      onCancel();
    }
  }, [step, onCancel]);
  
  // ENHANCED Continue button with explicit event handling
  const handleNext = useCallback((event?: React.MouseEvent) => {
    console.log('🔥🔥🔥 CONTINUE BUTTON CLICKED!');
    console.log('📊 Continue Button Debug:', {
      step,
      trainingType,
      showQuickStart,
      event_type: event?.type,
      event_target: event?.target,
      timestamp: new Date().toISOString()
    });
    
    try {
      if (step < 2) {
        const newStep = step + 1;
        console.log('🚀 ADVANCING: step', step, '→', newStep);
        
        setStep(prev => {
          console.log('📈 SetStep called: prev =', prev, 'new =', prev + 1);
          return prev + 1;
        });
        
        // Verify step change after state update
        setTimeout(() => {
          console.log('✅ Step after update should be:', step + 1);
        }, 100);
      } else {
        console.log('🏁 COMPLETING WORKOUT');
        handleComplete();
      }
    } catch (error) {
      console.error('❌ ERROR in handleNext:', error);
    }
  }, [step, handleComplete, trainingType, showQuickStart]);

  // Handle training type selection - FIXED: removed trainingType from dependencies
  const handleTrainingTypeChange = useCallback((newType: string) => {
    console.log('🎯 Training type change requested:', { from: trainingType, to: newType });
    if (newType !== trainingType) {
      console.log('✅ Training type actually changing');
      setTrainingType(newType);
    } else {
      console.log('⚠️ Training type unchanged, skipping update');
    }
  }, []); // FIXED: Remove trainingType from dependencies to prevent infinite loop

  // Memoize the next button disabled state to prevent re-calculation on every render
  const isNextDisabled = useMemo(() => {
    const disabled = (() => {
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
    })();
    
    console.log('🔘 Button disabled calculation:', { step, trainingType, disabled });
    return disabled;
  }, [step, trainingType]);

  // Add DOM inspection
  useEffect(() => {
    setTimeout(() => {
      const buttons = document.querySelectorAll('button');
      console.log('🔍 ALL BUTTONS IN DOM:', Array.from(buttons).map(btn => ({
        text: btn.textContent,
        disabled: btn.disabled,
        className: btn.className,
        hasOnClick: !!btn.onclick
      })));
    }, 1000);
  }, [step]);

  // MOVED: Loading state check AFTER all hooks are called
  if (isLoadingStats) {
    console.log('⏳ Rendering loading state');
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
      console.log('🎬 Rendering QuickStart');
      return (
        <QuickStartOption 
          onSelect={handleQuickStart} 
          onCustomize={handleSkipQuickStart} 
          stats={stats}
        />
      );
    }
    
    console.log('🎬 Rendering step:', step);
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
  
  console.log('🔘 Button Props Check:', {
    onClick: typeof handleNext,
    disabled: isNextDisabled,
    visible: shouldShowFooter,
    step,
    showQuickStart
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
            
            {/* EXPLICIT Continue Button with Enhanced Debugging */}
            <button 
              type="button"
              onClick={(e) => {
                console.log('🔥🔥🔥 EXPLICIT CONTINUE CLICKED!', {
                  event: e.type,
                  target: e.target,
                  currentTarget: e.currentTarget,
                  step,
                  disabled: isNextDisabled
                });
                handleNext(e);
              }}
              disabled={isNextDisabled}
              className={cn(
                "inline-flex items-center justify-center gap-2 whitespace-nowrap text-base font-montserrat font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none",
                "bg-gradient-to-r from-purple-600 to-pink-500",
                "hover:from-purple-700 hover:to-pink-600",
                "rounded-md h-11 px-5 py-2",
                "flex-1 sm:flex-none",
                "active:scale-[0.98]",
                isNextDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {getNextButtonLabel()}
              {step !== 2 && <ChevronRight className="ml-1 h-5 w-5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
