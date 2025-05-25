import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { TrainingTypeStep } from './wizard-steps/TrainingTypeStep';
import { FocusAndDurationStep } from './wizard-steps/FocusAndDurationStep';
import { ReviewAndStartStep } from './wizard-steps/ReviewAndStartStep';
import { WizardProgressBar } from './wizard-steps/WizardProgressBar';
import { SessionRecoveryPrompt } from './wizard-steps/SessionRecoveryPrompt';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { useAutoAdvance } from '@/hooks/useAutoAdvance';
import { useWizardStatePersistence } from '@/hooks/useWizardStatePersistence';
import { useWorkoutStore } from '@/store/workout';
import { toast } from '@/hooks/use-toast';
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
  // Add error boundary state
  const [hasError, setHasError] = useState(false);
  
  const [step, setStep] = useState(0);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [validationState, setValidationState] = useState(true);
  
  // Training config state - initialize with defaults first
  const [trainingType, setTrainingType] = useState('strength');
  const [bodyFocus, setBodyFocus] = useState<string[]>([]);
  const [duration, setDuration] = useState(45);
  const [tags, setTags] = useState<string[]>([]);

  // Workout store for state management
  const { startWorkout, setTrainingConfig } = useWorkoutStore();

  // State persistence and recovery with error handling
  const { saveWizardState, restoreWizardState, clearWizardState } = useWizardStatePersistence({
    throttleMs: 1000,
    enableThrottling: true
  });

  // Auto-advance with configurable settings
  const { triggerAutoAdvance, isAdvancing, canRollback, rollback, cleanup } = useAutoAdvance({
    delay: 500,
    onAdvance: () => {
      try {
        setStep(1);
      } catch (error) {
        console.error('Error during auto-advance:', error);
        setHasError(true);
      }
    },
    fallbackToManual: true,
    enableRollback: true
  });

  // Error boundary effect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Wizard error caught:', event.error);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // 🚨 ESSENTIAL DEBUG LOGGING
  console.log('🔄 ExerciseSetupWizard RENDER:', {
    step,
    showQuickStart,
    showRecovery,
    trainingType,
    duration,
    bodyFocus,
    isInitialized,
    statsLoading: isLoadingStats,
    statsExists: !!stats,
    hasError,
    isStarting,
    validationState,
    renderTimestamp: new Date().toISOString()
  });

  // Save wizard state whenever key values change
  useEffect(() => {
    if (isInitialized && !hasError) {
      try {
        saveWizardState({
          step,
          trainingType,
          bodyFocus,
          duration: estimateDuration(trainingType, bodyFocus)
        });
      } catch (error) {
        console.error('Error saving wizard state:', error);
      }
    }
  }, [step, trainingType, bodyFocus, isInitialized, saveWizardState, hasError]);

  // Initialize from stats or recovered state
  useEffect(() => {
    if (!isInitialized && !isLoadingStats && !hasError) {
      try {
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
      } catch (error) {
        console.error('Error during initialization:', error);
        setHasError(true);
      }
    }
  }, [stats, isLoadingStats, isInitialized, restoreWizardState, trainingType, hasError]);

  // QuickStart logic - only run once on mount
  useEffect(() => {
    if (!hasError) {
      try {
        const hasUsedSetupBefore = localStorage.getItem('has_used_setup');
        console.log('🚀 QuickStart check:', { hasUsedSetupBefore });
        
        if (!hasUsedSetupBefore && !showRecovery) {
          setShowQuickStart(true);
        }
      } catch (error) {
        console.error('Error checking QuickStart:', error);
      }
    }
  }, [showRecovery, hasError]);

  // Handle session recovery
  const handleResumeSetup = useCallback(() => {
    try {
      const recoveredState = restoreWizardState();
      if (recoveredState) {
        setStep(recoveredState.step);
        setTrainingType(recoveredState.trainingType);
        setBodyFocus(recoveredState.bodyFocus);
        setDuration(recoveredState.duration);
        setShowRecovery(false);
        console.log('✅ Session recovered successfully');
      }
    } catch (error) {
      console.error('Error resuming setup:', error);
      setHasError(true);
    }
  }, [restoreWizardState]);

  const handleStartFresh = useCallback(() => {
    try {
      clearWizardState();
      setShowRecovery(false);
      console.log('🆕 Starting fresh setup');
    } catch (error) {
      console.error('Error starting fresh:', error);
      setHasError(true);
    }
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
    if (!hasError) {
      console.log('👆 Swipe left detected');
      if (stepRef.current < 1 && !showQuickStartRef.current && !isAdvancing) {
        console.log('🚀 Advancing step via swipe');
        setStep(prev => prev + 1);
      }
    }
  }, [isAdvancing, hasError]);

  const onSwipeRight = useCallback(() => {
    if (!hasError) {
      console.log('👆 Swipe right detected');
      if (stepRef.current > 0) {
        console.log('🔙 Going back via swipe');
        setStep(prev => prev - 1);
      }
    }
  }, [hasError]);

  const { ref: touchRef } = useTouchGestures({
    onSwipeLeft,
    onSwipeRight,
    threshold: 50,
  });

  // Enhanced workout completion with validation and state management
  const handleComplete = useCallback(async () => {
    console.log('🏁 Starting workout completion process');
    
    // Validation check
    if (bodyFocus.length === 0) {
      console.warn('❌ Cannot start workout: No muscle groups selected');
      toast({
        title: "Selection Required",
        description: "Please select at least one muscle group to continue",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsStarting(true);
      console.log('⏳ Setting starting state to true');
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }

      const smartDuration = estimateDuration(trainingType, bodyFocus);
      const config: TrainingConfig = {
        trainingType,
        bodyFocus,
        duration: smartDuration,
        tags,
        expectedXp: Math.round(smartDuration * 2)
      };
      
      console.log('📋 Final workout config:', config);

      // Update workout store state
      setTrainingConfig(config);
      startWorkout();
      
      // Show success feedback
      toast({
        title: "Workout Created!",
        description: `Starting ${config.trainingType} workout for ${config.duration} minutes`
      });
      
      // Small delay for user feedback
      await new Promise(resolve => setTimeout(resolve, 300));
      
      clearWizardState();
      onComplete(config);
      
    } catch (error) {
      console.error('❌ Error completing workout setup:', error);
      setHasError(true);
      toast({
        title: "Setup Failed",
        description: "There was an error setting up your workout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsStarting(false);
    }
  }, [trainingType, bodyFocus, duration, tags, clearWizardState, onComplete, setTrainingConfig, startWorkout]);

  // Skip QuickStart function
  const handleSkipQuickStart = useCallback(() => {
    try {
      console.log('⏭️ Skipping QuickStart');
      setShowQuickStart(false);
      setStep(0);
      localStorage.setItem('has_used_setup', 'true');
    } catch (error) {
      console.error('Error skipping QuickStart:', error);
      setHasError(true);
    }
  }, []);

  // Use a quick start option
  const handleQuickStart = useCallback((config: Partial<TrainingConfig>) => {
    try {
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
    } catch (error) {
      console.error('Error with quick start:', error);
      setHasError(true);
    }
  }, [trainingType, clearWizardState, onComplete]);
  
  // Navigate to previous step with error handling
  const handleBack = useCallback(() => {
    try {
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
    } catch (error) {
      console.error('Error going back:', error);
      setHasError(true);
    }
  }, [step, clearWizardState, onCancel]);

  // Handle training type selection with auto-advance trigger
  const handleTrainingTypeChange = useCallback((newType: string) => {
    try {
      console.log('🎯 Training type change requested:', { from: trainingType, to: newType });
      if (newType !== trainingType) {
        console.log('✅ Training type actually changing');
        setTrainingType(newType);
        triggerAutoAdvance(`training-type-${newType}`);
      } else {
        console.log('⚠️ Training type unchanged, skipping update');
      }
    } catch (error) {
      console.error('Error changing training type:', error);
      setHasError(true);
    }
  }, [trainingType, triggerAutoAdvance]);

  // Handle body focus changes
  const handleBodyFocusChange = useCallback((newFocus: string[]) => {
    try {
      console.log('💪 Body focus change requested:', { from: bodyFocus, to: newFocus });
      setBodyFocus(newFocus);
    } catch (error) {
      console.error('Error changing body focus:', error);
      setHasError(true);
    }
  }, [bodyFocus]);

  // Handle validation changes from FocusAndDurationStep
  const handleValidationChange = useCallback((isValid: boolean) => {
    console.log('🔍 Validation state changed:', isValid);
    setValidationState(isValid);
  }, []);

  // Cleanup auto-advance on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Error boundary render
  if (hasError) {
    return (
      <div className="flex flex-col h-screen w-full bg-gray-900 text-white relative overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-4">The workout setup encountered an error</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()} variant="outline">
                Refresh Page
              </Button>
              <Button onClick={onCancel}>
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          enableAutoAdvance={!isAdvancing}
          autoAdvanceDelay={500}
        />;
      case 1:
        return <FocusAndDurationStep 
          selectedFocus={bodyFocus}
          duration={estimateDuration(trainingType, bodyFocus)}
          trainingType={trainingType}
          onUpdateFocus={handleBodyFocusChange}
          onUpdateDuration={() => {}}
          onUpdateTags={setTags}
          onValidationChange={handleValidationChange}
        />;
      default:
        return null;
    }
  };
  
  // Get the label for the next button based on current step and validation
  const getNextButtonLabel = () => {
    if (step === 1) {
      if (isStarting) return 'Starting...';
      if (!validationState) return 'Select Muscle Groups';
      return 'Start Workout';
    }
    return 'Continue';
  };
  
  // Get back button label
  const getBackButtonLabel = () => {
    if (step === 0) return 'Cancel';
    return 'Back';
  };

  // Footer should be visible when on Step 2 (index 1) - the customize workout step
  const shouldShowFooter = !showQuickStart && step === 1;
  
  console.log('🔘 Button Props Check:', {
    step,
    shouldShowFooter,
    showQuickStart,
    validationState,
    isStarting,
    bodyFocusLength: bodyFocus.length
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
            disabled={isStarting}
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
            {canRollback && !isStarting && (
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
            totalSteps={2}
          />
        )}
      </div>
      
      {/* Content area - scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {renderStepContent()}
      </div>
      
      {/* Enhanced Footer - Fixed at bottom - Only show for step 1 (customize workout) */}
      {shouldShowFooter && (
        <div className="flex-shrink-0 p-4 bg-gray-900 border-t border-gray-800 z-10">
          {/* Validation warning banner */}
          {!validationState && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">
                Please select at least one muscle group to start your workout
              </p>
            </motion.div>
          )}
          
          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="border-gray-700 flex-1 sm:flex-none"
              disabled={isStarting}
            >
              {getBackButtonLabel()}
            </Button>
            
            <Button 
              onClick={handleComplete}
              disabled={!validationState || isStarting}
              className={cn(
                "flex-1 sm:flex-none font-semibold transition-all duration-200",
                validationState && !isStarting
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              )}
              haptic={validationState && !isStarting}
              hapticPattern="heavy"
            >
              {isStarting ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Starting...
                </>
              ) : (
                <>
                  {getNextButtonLabel()}
                  {validationState && <ChevronRight className="ml-1 h-5 w-5" />}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
