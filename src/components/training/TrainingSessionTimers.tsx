
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
  
  return (
    <>
      {/* Standard rest timer (when manually triggered) */}
      {showRestTimerModal && !showEnhancedRestTimer && (
        <div className={cn(
          "fixed z-50 shadow-xl",
          isMobile ? "right-3 top-20 w-[calc(100%-24px)]" : "right-4 top-28 w-72"
        )}>
          <RestTimer
            isVisible={showRestTimerModal}
            onClose={() => { 
              onClose(); 
              setShowRestTimerModal(false);
              setRestTimerActive(false); 
            }}
            onComplete={onRestTimerComplete}
            maxTime={currentRestTime || 60}
          />
        </div>
      )}
      
      {/* Enhanced rest timer (shown after rating a set) */}
      {showEnhancedRestTimer && (
        <div className={cn(
          "fixed z-50 shadow-xl",
          isMobile ? "right-3 top-20 left-3" : "right-4 top-28 w-72"
        )}>
          <EnhancedRestTimer
            isVisible={showEnhancedRestTimer}
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
        </div>
      )}
    </>
  );
};
