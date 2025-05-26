
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

// Emergency render count limiter
const MAX_RENDER_COUNT = 50;
let renderCount = 0;

// Helper function to validate and fix duration values
const validateDuration = (duration: number): number => {
  if (!duration || typeof duration !== 'number' || isNaN(duration)) {
    return 45;
  }
  
  // If duration is in milliseconds, convert to minutes
  if (duration > 1000) {
    duration = Math.round(duration / 60000);
  }
  
  return Math.max(15, Math.min(120, duration));
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
    duration += 15;
  } else if (bodyFocus.length === 0) {
    duration -= 10;
  }
  
  return Math.max(15, Math.min(120, duration));
};

export function ExerciseSetupWizard({ onComplete, onCancel, stats, isLoadingStats }: ExerciseSetupWizardProps) {
  // Emergency render count check
  renderCount++;
  if (renderCount > MAX_RENDER_COUNT) {
    console.error('🚨 Emergency render limit reached, preventing infinite loop');
    return (
      <div className="flex flex-col h-screen w-full bg-gray-900 text-white relative overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Render Limit Reached</h2>
            <p className="text-gray-400 mb-4">Please refresh the page to continue</p>
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </div>
        </div>
      </div>
    );
  }

  // Reset render count after successful render
  useEffect(() => {
    const timer = setTimeout(() => {
      renderCount = 0;
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Simplified initialization flags instead of complex ref pattern
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasCheckedQuickStart, setHasCheckedQuickStart] = useState(false);
  const [hasCheckedRecovery, setHasCheckedRecovery] = useState(false);
  const [hasProcessedStats, setHasProcessedStats] = useState(false);

  // Core state
  const [step, setStep] = useState(0);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [validationState, setValidationState] = useState(true);
  
  // Training config state with stable defaults
  const [trainingType, setTrainingType] = useState('strength');
  const [bodyFocus, setBodyFocus] = useState<string[]>([]);
  const [duration, setDuration] = useState(45);
  const [tags, setTags] = useState<string[]>([]);

  // Workout store
  const { startWorkout, setTrainingConfig } = useWorkoutStore();

  // State persistence with increased throttling
  const { saveWizardState, restoreWizardState, clearWizardState } = useWizardStatePersistence({
    throttleMs: 2000,
    enableThrottling: true
  });

  // Auto-advance with fallback to manual
  const { triggerAutoAdvance, isAdvancing, canRollback, rollback, cleanup } = useAutoAdvance({
    delay: 500,
    onAdvance: () => setStep(1),
    fallbackToManual: true,
    enableRollback: true
  });

  // STEP 1: Check for session recovery (only once)
  useEffect(() => {
    if (!hasCheckedRecovery && !isLoadingStats) {
      console.log('🔄 Checking for recoverable session');
      try {
        const recoveredState = restoreWizardState();
        if (recoveredState && recoveredState.step > 0) {
          console.log('📦 Found recoverable session:', recoveredState);
          setShowRecovery(true);
          setHasCheckedRecovery(true);
          return;
        }
      } catch (error) {
        console.error('❌ Error checking recovery:', error);
      }
      setHasCheckedRecovery(true);
    }
  }, [hasCheckedRecovery, isLoadingStats, restoreWizardState]);

  // STEP 2: Check QuickStart (only once, after recovery check)
  useEffect(() => {
    if (hasCheckedRecovery && !hasCheckedQuickStart && !showRecovery && !isLoadingStats) {
      console.log('🚀 Checking QuickStart eligibility');
      try {
        const hasUsedSetupBefore = localStorage.getItem('has_used_setup');
        if (!hasUsedSetupBefore) {
          setShowQuickStart(true);
        }
      } catch (error) {
        console.error('❌ Error checking QuickStart:', error);
      }
      setHasCheckedQuickStart(true);
    }
  }, [hasCheckedRecovery, hasCheckedQuickStart, showRecovery, isLoadingStats]);

  // STEP 3: Process stats (only once, when stats are available)
  useEffect(() => {
    if (stats && !hasProcessedStats && hasCheckedRecovery && hasCheckedQuickStart) {
      console.log('📊 Processing workout stats:', stats);
      try {
        if (stats.recommendedType) {
          const newType = stats.recommendedType.toLowerCase();
          setTrainingType(newType);
        }
        
        const smartDuration = estimateDuration(stats.recommendedType || 'strength', []);
        setDuration(smartDuration);
        
        setHasProcessedStats(true);
      } catch (error) {
        console.error('❌ Error processing stats:', error);
        setHasProcessedStats(true); // Still mark as processed to prevent retries
      }
    }
  }, [stats, hasProcessedStats, hasCheckedRecovery, hasCheckedQuickStart]);

  // STEP 4: Mark initialization complete
  useEffect(() => {
    if (hasCheckedRecovery && hasCheckedQuickStart && (!stats || hasProcessedStats) && !isLoadingStats) {
      if (isInitializing) {
        console.log('✅ Wizard initialization complete');
        setIsInitializing(false);
      }
    }
  }, [hasCheckedRecovery, hasCheckedQuickStart, hasProcessedStats, stats, isLoadingStats, isInitializing]);

  // Save state changes (debounced)
  const saveStateRef = useRef<NodeJS.Timeout>();
  useEffect(() => {
    if (isInitializing) return;

    // Debounce saves to prevent rapid successive calls
    if (saveStateRef.current) {
      clearTimeout(saveStateRef.current);
    }

    saveStateRef.current = setTimeout(() => {
      try {
        saveWizardState({
          step,
          trainingType,
          bodyFocus,
          duration: estimateDuration(trainingType, bodyFocus)
        });
      } catch (error) {
        console.error('❌ Error saving wizard state:', error);
      }
    }, 1000);

    return () => {
      if (saveStateRef.current) {
        clearTimeout(saveStateRef.current);
      }
    };
  }, [step, trainingType, bodyFocus, saveWizardState, isInitializing]);

  // Stable callback functions to prevent re-renders
  const handleResumeSetup = useCallback(() => {
    try {
      const recoveredState = restoreWizardState();
      if (recoveredState) {
        setStep(recoveredState.step);
        setTrainingType(recoveredState.trainingType);
        setBodyFocus(recoveredState.bodyFocus);
        setDuration(recoveredState.duration);
        setShowRecovery(false);
      }
    } catch (error) {
      console.error('❌ Error resuming setup:', error);
    }
  }, [restoreWizardState]);

  const handleStartFresh = useCallback(() => {
    try {
      clearWizardState();
      setShowRecovery(false);
    } catch (error) {
      console.error('❌ Error starting fresh:', error);
    }
  }, [clearWizardState]);

  // Stable training type change handler
  const handleTrainingTypeChange = useCallback((newType: string) => {
    if (newType !== trainingType) {
      setTrainingType(newType);
    }
  }, [trainingType]);

  const handleBodyFocusChange = useCallback((newFocus: string[]) => {
    setBodyFocus(newFocus);
  }, []);

  const handleValidationChange = useCallback((isValid: boolean) => {
    setValidationState(isValid);
  }, []);

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
      toast({
        title: "Setup Failed",
        description: "There was an error setting up your workout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsStarting(false);
    }
  }, [trainingType, bodyFocus, clearWizardState, onComplete, setTrainingConfig, startWorkout, tags]);

  // Skip QuickStart function
  const handleSkipQuickStart = useCallback(() => {
    try {
      console.log('⏭️ Skipping QuickStart');
      setShowQuickStart(false);
      setStep(0);
      localStorage.setItem('has_used_setup', 'true');
    } catch (error) {
      console.error('❌ Error skipping QuickStart:', error);
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
      console.error('❌ Error with quick start:', error);
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
      console.error('❌ Error going back:', error);
    }
  }, [step, clearWizardState, onCancel]);

  // Use refs to stabilize touch gesture callbacks
  const stepRef = useRef(step);
  const showQuickStartRef = useRef(showQuickStart);
  
  useEffect(() => {
    stepRef.current = step;
    showQuickStartRef.current = showQuickStart;
  }, [step, showQuickStart]);

  // Configure touch gestures for swipe navigation with stable callbacks
  const onSwipeLeft = useCallback(() => {
    if (isInitializing) return;
    
    console.log('👆 Swipe left detected');
    if (stepRef.current < 1 && !showQuickStartRef.current && !isAdvancing) {
      console.log('🚀 Advancing step via swipe');
      setStep(prev => prev + 1);
    }
  }, [isAdvancing, isInitializing]);

  const onSwipeRight = useCallback(() => {
    if (isInitializing) return;
    
    console.log('👆 Swipe right detected');
    if (stepRef.current > 0) {
      console.log('🔙 Going back via swipe');
      setStep(prev => prev - 1);
    }
  }, [isInitializing]);

  const { ref: touchRef } = useTouchGestures({
    onSwipeLeft,
    onSwipeRight,
    threshold: 50,
  });

  // Loading state render
  const renderLoadingState = () => (
    <div className="flex flex-col h-screen w-full bg-gray-900 text-white relative overflow-hidden">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading workout recommendations...</p>
        </div>
      </div>
    </div>
  );

  // Initializing state render
  const renderInitializingState = () => (
    <div className="flex flex-col h-screen w-full bg-gray-900 text-white relative overflow-hidden">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse w-8 h-8 bg-purple-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Setting up your workout...</p>
        </div>
      </div>
    </div>
  );

  // Session recovery render
  const renderSessionRecovery = () => (
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

  // Show loading state while stats are loading
  if (isLoadingStats) {
    console.log('⏳ Rendering loading state');
    return renderLoadingState();
  }

  // Show initializing state while setting up
  if (isInitializing) {
    console.log('🔄 Rendering initializing state');
    return renderInitializingState();
  }

  // Render session recovery if needed
  if (showRecovery) {
    return renderSessionRecovery();
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
          enableAutoAdvance={false} // Explicitly disable auto-advance
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

  // Footer visibility - Show footer on step 0 and step 1
  const shouldShowFooter = !showQuickStart && !showRecovery && (step === 0 || step === 1);
  
  // Get appropriate button labels
  const getNextButtonLabel = () => {
    if (step === 0) return 'Continue';
    if (step === 1) {
      if (isStarting) return 'Starting...';
      if (!validationState) return 'Select Muscle Groups';
      return 'Start Workout';
    }
    return 'Continue';
  };
  
  const getBackButtonLabel = () => {
    if (step === 0) return 'Cancel';
    return 'Back';
  };

  // Navigation handlers
  const handleNext = () => {
    if (step === 0) {
      if (!trainingType) {
        toast({
          title: "Selection Required",
          description: "Please select a training type to continue",
          variant: "destructive"
        });
        return;
      }
      setStep(1);
    } else if (step === 1) {
      handleComplete();
    }
  };

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
        
        {!showQuickStart && !showRecovery && (
          <WizardProgressBar 
            currentStep={step} 
            totalSteps={2}
          />
        )}
      </div>
      
      {/* Content area */}
      <div className={cn(
        "flex-1 overflow-y-auto px-4 py-6",
        shouldShowFooter && "pb-24"
      )}>
        {renderStepContent()}
      </div>
      
      {/* Show footer on both step 0 and step 1 */}
      {shouldShowFooter && (
        <>
          {/* Validation warning */}
          {step === 1 && !validationState && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-20 left-4 right-4 z-30"
            >
              <div className="p-3 bg-red-900/90 backdrop-blur-sm border border-red-500/50 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">
                  Please select at least one muscle group to start your workout
                </p>
              </div>
            </motion.div>
          )}

          {/* Footer with navigation buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 left-4 right-4 z-30"
          >
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                className="border-gray-700 bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700"
                disabled={isStarting}
                size="lg"
              >
                <ChevronLeft className="mr-1 h-5 w-5" />
                {getBackButtonLabel()}
              </Button>
              
              <Button 
                onClick={handleNext}
                disabled={(step === 1 && !validationState) || isStarting || (step === 0 && !trainingType)}
                size="lg"
                className={cn(
                  "flex-1 font-semibold transition-all duration-300 min-h-12",
                  "shadow-lg backdrop-blur-sm",
                  (step === 0 && trainingType) || (step === 1 && validationState) && !isStarting
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-purple-500/25"
                    : "bg-gray-700/90 text-gray-400 cursor-not-allowed border border-gray-600"
                )}
              >
                {isStarting ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Starting Workout...
                  </>
                ) : (
                  <>
                    {getNextButtonLabel()}
                    {((step === 0 && trainingType) || (step === 1 && validationState)) && <ChevronRight className="ml-2 h-5 w-5" />}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
