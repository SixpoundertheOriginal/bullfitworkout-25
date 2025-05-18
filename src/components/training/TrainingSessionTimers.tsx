
import React from 'react';
import { RestTimer } from "@/components/RestTimer";
import { EnhancedRestTimer } from "@/components/training/EnhancedRestTimer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface TrainingSessionTimersProps {
  showRestTimerModal: boolean;
  showEnhancedRestTimer: boolean;
  currentRestTime: number;
  lastCompletedExercise?: string | null;
  nextSetDetails: any;
  nextSetRecommendation: any;
  motivationalMessage: string;
  volumeStats: string;
  onClose: () => void;
  onRestTimerComplete: () => void;
  setRestTimerActive: (active: boolean) => void;
  setShowEnhancedRestTimer: (show: boolean) => void;
  setShowRestTimerModal: (show: boolean) => void;
  setPostSetFlow: (flow: string) => void;
}

export const TrainingSessionTimers: React.FC<TrainingSessionTimersProps> = ({
  showRestTimerModal,
  showEnhancedRestTimer,
  currentRestTime,
  lastCompletedExercise,
  nextSetDetails,
  nextSetRecommendation,
  motivationalMessage,
  volumeStats,
  onClose,
  onRestTimerComplete,
  setRestTimerActive,
  setShowEnhancedRestTimer,
  setShowRestTimerModal,
  setPostSetFlow,
}) => {
  const isMobile = useIsMobile();
  
  // Only show one timer at a time - prioritize enhanced timer over standard timer
  const showStandardTimer = showRestTimerModal && !showEnhancedRestTimer;
  
  if (!showStandardTimer && !showEnhancedRestTimer) {
    return null;
  }
  
  return (
    <div className={cn(
      "fixed z-50 shadow-xl transition-all duration-300",
      isMobile ? "right-3 top-20" : "right-4 top-28",
      showEnhancedRestTimer ? (isMobile ? "left-3 w-auto" : "w-72") : "w-72"
    )}>
      {showStandardTimer && (
        <RestTimer
          isVisible={true}
          onClose={() => { 
            onClose(); 
            setShowRestTimerModal(false);
            setRestTimerActive(false); 
          }}
          onComplete={onRestTimerComplete}
          maxTime={currentRestTime || 60}
        />
      )}
      
      {showEnhancedRestTimer && (
        <EnhancedRestTimer
          isVisible={true}
          onClose={() => { 
            setShowEnhancedRestTimer(false); 
            setRestTimerActive(false);
            setPostSetFlow('idle');
          }}
          onComplete={onRestTimerComplete}
          maxTime={currentRestTime || 60}
          exerciseName={lastCompletedExercise || undefined}
          nextSet={nextSetDetails}
          recommendation={nextSetRecommendation}
          motivationalMessage={motivationalMessage}
          volumeStats={volumeStats}
        />
      )}
    </div>
  );
};
