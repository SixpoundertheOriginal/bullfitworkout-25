
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TrainingTypeStep } from './wizard-steps/TrainingTypeStep';
import { FocusAndDurationStep } from './wizard-steps/FocusAndDurationStep';
import { ReviewAndStartStep } from './wizard-steps/ReviewAndStartStep';
import { WizardProgressBar } from './wizard-steps/WizardProgressBar';
import { SessionRecoveryPrompt } from './wizard-steps/SessionRecoveryPrompt';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { useAutoAdvance } from '@/hooks/useAutoAdvance';
import { useWizardStatePersistence } from '@/hooks/useWizardStatePersistence';
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

// Helper function to validate and fix duration values
const validateDuration = (duration: number): number => {
  console.log('🔧 Validating duration:', { original: duration, type: typeof duration });
  
  // Handle invalid or extreme values
  if (!duration || typeof duration !== 'number' || isNaN(duration)) {
    console.warn('⚠️ Invalid duration, using default 45');
    return 45;
  }
  
  // If duration is in milliseconds (like 48014000), convert to minutes
  if (duration > 1000) {
    const minutesFromMs = Math.round(duration / 60000);
    console.log('🔄 Converting from milliseconds:', { ms: duration, minutes: minutesFromMs });
    duration = minutesFromMs;
  }
  
  // Cap duration between reasonable values
  if (duration < 15) {
    console.log('🔄 Duration too low, setting to 15 minutes');
    return 15;
  }
  
  if (duration > 120) {
    console.log('🔄 Duration too high, setting to 120 minutes');
    return 120;
  }
  
  console.log('✅ Duration validation passed:', duration);
  return duration;
};

// Smart duration estimation based on training type and body focus
const estimateDuration = (trainingType: string, bodyFocus: string[]): number => {
  const baseMinutes = {
    'strength': 45,
    'cardio': 30,
    'hiit': 25,
    'mobility': 35,
    'custom': 45
  };
  
  let duration = baseMinutes[trainingType as keyof typeof baseMinutes] || 45;
  
  // Adjust based on body focus count
  if (bodyFocus.length > 3) {
    duration += 15; // More focus areas = longer workout
  } else if (bodyFocus.length === 0) {
    duration -= 10; // No specific focus = shorter
  }
  
  return Math.max(15, Math.min(120, duration));
};

export function ExerciseSetupWizard({ onComplete, onCancel, stats, isLoadingStats }: ExerciseSetupWizardProps) {
  const [step, setStep] = useState(0);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Training config state - initialize with defaults first
  const [trainingType, setTrainingType] = useState('strength');
  const [bodyFocus, setBodyFocus] = useState<string[]>([]);
  const [duration, setDuration] = useState(45);
  const [tags, setTags] = useState<string[]>([]);

  // State persistence and recovery
  const { saveWizardState, restoreWizardState, clearWizardState } = useWizardStatePersistence({
    throttleMs: 1000, // Save at most once per second
    enableThrottling: true
  });

  // Auto-advance with configurable settings
  const { triggerAutoAdvance, isAdvancing, canRollback, rollback, cleanup } = useAutoAdvance({
    delay: 500, // Default delay, could be A/B tested
    onAdvance: () => setStep(1),
    fallbackToManual: true,
    enableRollback: true
  });

  // 🚨 ESSENTIAL DEBUG LOGGING
  console.log('🔄 ExerciseSetupWizard RENDER:', {
    step,
    showQuickStart,
    showRecovery,
    trainingType,
    duration,
    isInitialized,
    statsLoading: isLoadingStats,
    statsExists: !!stats,
    renderTimestamp: new Date().toISOString()
  });

  // Save wizard state whenever key values change
  useEffect(() => {
    if (isInitialized) {
      saveWizardState({
        step,
        trainingType,
        bodyFocus,
        duration: estimateDuration(trainingType, bodyFocus) // Use smart estimation
      });
    }
  }, [step, trainingType, bodyFocus, isInitialized, saveWizardState]);

  // Initialize from stats or recovered state
  useEffect(() => {
    if (!isInitialized && !isLoadingStats) {
      // First check for session recovery
      const recoveredState = restoreWizardState();
      
      if (recoveredState && recoveredState.step > 0) {
        console.log('🔄 Found recoverable session:', recoveredState);
        setShowRecovery(true);
        setIsInitialized(true);
        return;
      }
      
      // Initialize from stats if available
      if (stats) {
        console.log('🎯 Initializing from stats:', {
          recommendedType: stats.recommendedType,
          recommendedDuration: stats.recommendedDuration
        });
        
        if (stats.recommendedType) {
          const newType = stats.recommendedType.toLowerCase();
          console.log('🔄 Setting training type from stats:', newType);
          setTrainingType(newType);
        }
        
        // Use smart duration estimation instead of raw stats
        const smartDuration = estimateDuration(stats.recommendedType || trainingType, []);
        console.log('🔄 Setting smart estimated duration:', smartDuration);
        setDuration(smartDuration);
      }
      
      setIsInitialized(true);
    }
  }, [stats, isLoadingStats, isInitialized, restoreWizardState, trainingType]);

  // QuickStart logic - only run once on mount
  useEffect(() => {
    const hasUsedSetupBefore = localStorage.getItem('has_used_setup');
    console.log('🚀 QuickStart check:', { hasUsedSetupBefore });
    
    if (!hasUsedSetupBefore && !showRecovery) {
      setShowQuickStart(true);
    }
  }, [showRecovery]);

  // Handle session recovery
  const handleResumeSetup = useCallback(() => {
    const recoveredState = restoreWizardState();
    if (recoveredState) {
      setStep(recoveredState.step);
      setTrainingType(recoveredState.trainingType);
      setBodyFocus(recoveredState.bodyFocus);
      setDuration(recoveredState.duration);
      setShowRecovery(false);
      console.log('✅ Session recovered successfully');
    }
  }, [restoreWizardState]);

  const handleStartFresh = useCallback(() => {
    clearWizardState();
    setShowRecovery(false);
    console.log('🆕 Starting fresh setup');
  }, [clearWizardState]);

  // Calculate expected XP based on smart duration estimation
  const expectedXp = useMemo(() => {
    const smartDuration = estimateDuration(trainingType, bodyFocus);
    return Math.round(smartDuration * 2);
  }, [trainingType, bodyFocus]);
  
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
    if (stepRef.current < 1 && !showQuickStartRef.current && !isAdvancing) { // Only 2 steps now
      console.log('🚀 Advancing step via swipe');
      setStep(prev => prev + 1);
    }
  }, [isAdvancing]);

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

  // Prepare the configuration object to pass to the parent
  const handleComplete = useCallback(() => {
    console.log('🏁 COMPLETING WORKOUT');
    const smartDuration = estimateDuration(trainingType, bodyFocus);
    const config: TrainingConfig = {
      trainingType,
      bodyFocus,
      duration: smartDuration, // Use smart estimation
      tags,
      expectedXp: Math.round(smartDuration * 2)
    };
    
    console.log('📋 Final config:', config);
    clearWizardState(); // Clean up after completion
    onComplete(config);
  }, [trainingType, bodyFocus, tags, clearWizardState, onComplete]);

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
    const smartDuration = estimateDuration(config.trainingType || trainingType, config.bodyFocus || []);
    const fullConfig = {
      trainingType: config.trainingType || trainingType,
      bodyFocus: config.bodyFocus || [],
      duration: smartDuration,
      tags: config.tags || [],
      expectedXp: Math.round(smartDuration * 2)
    };
    
    localStorage.setItem('has_used_setup', 'true');
    clearWizardState();
    onComplete(fullConfig);
  }, [trainingType, clearWizardState, onComplete]);
  
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
      clearWizardState();
      onCancel();
    }
  }, [step, clearWizardState, onCancel]);
  
  // Continue button for manual progression (Step 1 → Complete)
  const handleNext = useCallback(() => {
    console.log('🔥🔥🔥 CONTINUE BUTTON CLICKED!');
    console.log('📊 Continue Button Debug:', {
      step,
      trainingType,
      duration,
      timestamp: new Date().toISOString()
    });
    
    try {
      if (step < 1) { // Only 2 steps now: 0 (auto) and 1 (manual)
        const newStep = step + 1;
        console.log('🚀 ADVANCING: step', step, '→', newStep);
        setStep(prev => prev + 1);
      } else {
        console.log('🏁 COMPLETING WORKOUT');
        handleComplete();
      }
    } catch (error) {
      console.error('❌ ERROR in handleNext:', error);
    }
  }, [step, handleComplete]);

  // Handle training type selection with auto-advance trigger
  const handleTrainingTypeChange = useCallback((newType: string) => {
    console.log('🎯 Training type change requested:', { from: trainingType, to: newType });
    if (newType !== trainingType) {
      console.log('✅ Training type actually changing');
      setTrainingType(newType);
      // Trigger auto-advance after selection
      triggerAutoAdvance(`training-type-${newType}`);
    } else {
      console.log('⚠️ Training type unchanged, skipping update');
    }
  }, [trainingType, triggerAutoAdvance]);

  // Handle body focus changes
  const handleBodyFocusChange = useCallback((newFocus: string[]) => {
    console.log('💪 Body focus change requested:', { from: bodyFocus, to: newFocus });
    setBodyFocus(newFocus);
  }, [bodyFocus]);

  // Memoize the next button disabled state
  const isNextDisabled = useMemo(() => {
    const disabled = (() => {
      switch (step) {
        case 0:
          return !trainingType; // Step 0 uses auto-advance, but keep for safety
        case 1:
          return false; // Body focus is optional
        default:
          return false;
      }
    })();
    
    console.log('🔘 Button disabled calculation:', { step, trainingType, disabled });
    return disabled;
  }, [step, trainingType]);

  // Cleanup auto-advance on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

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

  // Render session recovery if needed
  if (showRecovery) {
    return (
      <div className="flex flex-col h-screen w-full bg-gray-900 text-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full">
            <SessionRecoveryPrompt
              onResumeSetup={handleResumeSetup}
              onStartFresh={handleStartFresh}
              timeAgo="recently"
              trainingType={trainingType}
            />
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
          onAutoAdvance={() => setStep(1)}
          stats={stats}
          enableAutoAdvance={!isAdvancing} // Disable if already advancing
          autoAdvanceDelay={500}
        />;
      case 1:
        return <FocusAndDurationStep 
          selectedFocus={bodyFocus}
          duration={estimateDuration(trainingType, bodyFocus)} // Use smart estimation
          trainingType={trainingType}
          onUpdateFocus={handleBodyFocusChange}
          onUpdateDuration={() => {}} // Duration is now auto-calculated
          onUpdateTags={setTags}
        />;
      default:
        return null;
    }
  };
  
  // Get the label for the next button based on current step
  const getNextButtonLabel = () => {
    if (step === 1) return 'Start Workout';
    return 'Continue';
  };
  
  // Get back button label
  const getBackButtonLabel = () => {
    if (step === 0) return 'Cancel';
    return 'Back';
  };

  // Footer should be visible when NOT in QuickStart mode AND not on Step 0 (auto-advance)
  const shouldShowFooter = !showQuickStart && step > 0;
  
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
                : 'Customize Workout'
            }
          </h1>
          
          <div className="w-16 flex justify-end">
            {canRollback && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={rollback}
                className="text-xs text-gray-500"
              >
                Undo
              </Button>
            )}
          </div>
        </div>
        
        {!showQuickStart && (
          <WizardProgressBar 
            currentStep={step} 
            totalSteps={2} // Reduced to 2 steps
          />
        )}
      </div>
      
      {/* Content area - scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {renderStepContent()}
      </div>
      
      {/* Footer - Fixed at bottom - Only show for manual progression step (1) */}
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
              variant="gradient"
              onClick={handleNext}
              disabled={isNextDisabled}
              className="flex-1 sm:flex-none"
            >
              {getNextButtonLabel()}
              <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
