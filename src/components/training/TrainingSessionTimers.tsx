
import React from 'react';
import { RestTimer } from "@/components/RestTimer";
import { EnhancedRestTimer } from "@/components/training/EnhancedRestTimer";

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
  setShowRestTimerModal: (show: boolean) => void; // Added this missing prop
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
  setShowRestTimerModal, // Added this missing prop
  setPostSetFlow,
}) => {
  return (
    <>
      {/* Standard rest timer (when manually triggered) */}
      {showRestTimerModal && !showEnhancedRestTimer && (
        <div className="fixed right-4 top-32 z-50 w-72">
          <RestTimer
            isVisible={showRestTimerModal}
            onClose={() => { 
              onClose(); 
              setShowRestTimerModal(false); // Use setShowRestTimerModal instead of onClose
              setRestTimerActive(false); 
            }}
            onComplete={onRestTimerComplete}
            maxTime={currentRestTime || 60}
          />
        </div>
      )}
      
      {/* Enhanced rest timer (shown after rating a set) */}
      {showEnhancedRestTimer && (
        <div className="fixed right-4 top-32 z-50 w-72">
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
