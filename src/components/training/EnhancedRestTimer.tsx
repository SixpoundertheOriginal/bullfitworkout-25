
import React, { useState, useEffect, useRef } from "react";
import { Timer, X, ChevronUp, ChevronDown, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { MinimalExerciseSet, SetRecommendation } from "@/utils/setRecommendations";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface EnhancedRestTimerProps {
  onComplete?: () => void;
  maxTime?: number;
  isVisible: boolean;
  onClose: () => void;
  exerciseName?: string;
  nextSet?: MinimalExerciseSet;
  recommendation?: SetRecommendation;
  motivationalMessage?: string;
  volumeStats?: string;
}

export const EnhancedRestTimer: React.FC<EnhancedRestTimerProps> = ({ 
  onComplete, 
  maxTime = 60,
  isVisible, 
  onClose,
  exerciseName,
  nextSet,
  recommendation,
  motivationalMessage,
  volumeStats
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [targetReached, setTargetReached] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(0);
  const isMobile = useIsMobile();
  
  // Progress will show 100% when target time is reached
  const progressPercentage = Math.min((elapsedTime / maxTime) * 100, 100);

  // Calculate time remaining
  const timeRemaining = Math.max(0, maxTime - elapsedTime);

  useEffect(() => {
    if (isVisible) {
      setElapsedTime(0);
      setIsActive(true);
      setTargetReached(false);
      startTimerInterval();
    } else {
      clearTimerInterval();
    }
    
    return () => {
      clearTimerInterval();
    };
  }, [isVisible, maxTime]);

  useEffect(() => {
    if (isActive) {
      startTimerInterval();
    } else {
      clearTimerInterval();
    }
    
    return () => {
      clearTimerInterval();
    };
  }, [isActive, maxTime]);

  const clearTimerInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTimerInterval = () => {
    clearTimerInterval(); // Ensure no duplicate timers
    
    lastTickRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = Math.floor((now - lastTickRef.current) / 1000);
      
      if (deltaSeconds >= 1) {
        lastTickRef.current = now;
        
        setElapsedTime(prev => {
          const newTime = prev + deltaSeconds;
          
          // If we've reached the target time but haven't notified yet
          if (newTime >= maxTime && !targetReached) {
            setTargetReached(true);
            if (onComplete) onComplete();
            
            // Show a toast notification
            toast.success("Rest completed! Ready for your next set.", {
              duration: 3000
            });
            
            return maxTime;
          }
          
          return newTime;
        });
      }
    }, 250); // Check more frequently for smoother updates
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setElapsedTime(0);
    setIsActive(true);
    setTargetReached(false);
    
    if (isActive) {
      clearTimerInterval();
      startTimerInterval();
    }
  };
  
  const skipTimer = () => {
    setElapsedTime(maxTime);
    setTargetReached(true);
    clearTimerInterval();
    
    if (onComplete) {
      onComplete();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const adjustTime = (seconds: number) => {
    setElapsedTime(prev => {
      const newTime = Math.max(0, Math.min(maxTime, prev + seconds));
      return newTime;
    });
  };

  if (!isVisible) return null;

  // Mobile view: Full-screen bottom sheet
  if (isMobile) {
    return (
      <Sheet open={isVisible} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="bottom" className="bg-gray-900 p-0 border-t border-gray-800 h-auto max-h-[85vh]">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Timer size={18} className={cn(
                "text-purple-400",
                targetReached ? "text-orange-400" : "",
                isActive && !targetReached && "animate-pulse"
              )} />
              <span className="font-medium">Rest Timer</span>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="p-5">
            <div className="text-center mb-5">
              <span className={cn(
                "text-5xl font-mono transition-all duration-300",
                targetReached ? "text-orange-400" : ""
              )}>
                {formatTime(timeRemaining)}
              </span>
              {targetReached && (
                <div className="text-sm text-orange-400 mt-2 animate-pulse">
                  Time's up! ({formatTime(maxTime)})
                </div>
              )}
            </div>
            
            <Progress 
              value={progressPercentage} 
              className={cn(
                "h-2 mb-6 bg-gray-800 overflow-hidden",
                targetReached 
                  ? "[&>div]:bg-orange-500" 
                  : "[&>div]:bg-purple-500"
              )}
            />

            {/* Timer adjustment controls - more space between buttons on mobile */}
            <div className="flex justify-center gap-6 mb-6">
              <Button 
                variant="outline" 
                onClick={() => adjustTime(-15)}
                className="bg-gray-800 border-gray-700 hover:bg-gray-700 h-12 px-4"
              >
                -15s
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => adjustTime(15)}
                className="bg-gray-800 border-gray-700 hover:bg-gray-700 h-12 px-4"
              >
                +15s
              </Button>
            </div>
            
            {/* Next set info */}
            <AnimatePresence>
              {exerciseName && nextSet && !targetReached && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700/30"
                >
                  <h4 className="font-medium text-base text-gray-300 mb-3">Get Ready For:</h4>
                  <div className="flex flex-col">
                    <span className="text-purple-300 font-medium text-lg">{exerciseName}</span>
                    <div className="flex items-center gap-2 mt-2 text-base">
                      <span>Set {nextSet.set_number || "next"}:</span>
                      <span className={cn(
                        "font-medium",
                        recommendation && nextSet.weight !== recommendation.weight ? "text-green-400" : ""
                      )}>
                        {recommendation?.weight || nextSet.weight}kg
                      </span>
                      <span>×</span>
                      <span className={cn(
                        "font-medium",
                        recommendation && nextSet.reps !== recommendation.reps ? "text-green-400" : ""
                      )}>
                        {recommendation?.reps || nextSet.reps} reps
                      </span>
                    </div>
                    
                    {recommendation?.message && (
                      <p className="text-sm text-gray-400 mt-3 italic">
                        {recommendation.message}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Motivational message */}
            <AnimatePresence>
              {(motivationalMessage || volumeStats) && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-6 p-3"
                >
                  {motivationalMessage && (
                    <p className="text-gray-300 mb-2 text-base">{motivationalMessage}</p>
                  )}
                  
                  {volumeStats && (
                    <p className="text-purple-400 font-medium text-base">{volumeStats}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex justify-between gap-3">
              <Button 
                variant="outline" 
                className="flex-1 bg-gray-800 border-gray-700 hover:bg-gray-700 h-14"
                onClick={resetTimer}
              >
                Reset
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 bg-gray-800 border-gray-700 hover:bg-gray-700 h-14"
                onClick={toggleTimer}
              >
                {isActive ? 'Pause' : 'Resume'}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 bg-gray-800 border-gray-700 hover:bg-gray-700 h-14"
                onClick={skipTimer}
              >
                <SkipForward size={16} className="mr-1" />
                Skip
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop view: Card-based approach
  return (
    <div className={cn(
      "bg-gray-900 border border-gray-800 rounded-lg shadow-xl",
      "transition-all duration-300 ease-in-out",
      "animate-fade-in",
      targetReached ? "border-orange-500/30 shadow-orange-500/10" : ""
    )}>
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Timer size={18} className={cn(
            "text-purple-400",
            targetReached ? "text-orange-400" : "",
            isActive && !targetReached && "animate-pulse"
          )} />
          <span className="font-medium">Rest Timer</span>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="p-4">
        <div className="text-center mb-3">
          <span className={cn(
            "text-3xl font-mono transition-all duration-300",
            targetReached ? "text-orange-400" : ""
          )}>
            {formatTime(timeRemaining)}
          </span>
          {targetReached && (
            <div className="text-xs text-orange-400 mt-1 animate-pulse">
              Time's up! ({formatTime(maxTime)})
            </div>
          )}
        </div>
        
        <Progress 
          value={progressPercentage} 
          className={cn(
            "h-2 mb-4 bg-gray-800 overflow-hidden",
            targetReached 
              ? "[&>div]:bg-orange-500" 
              : "[&>div]:bg-purple-500"
          )}
        />

        {/* Timer adjustment controls */}
        <div className="flex justify-center gap-4 mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => adjustTime(-15)}
            className="bg-gray-800 border-gray-700 hover:bg-gray-700"
          >
            -15s
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => adjustTime(15)}
            className="bg-gray-800 border-gray-700 hover:bg-gray-700"
          >
            +15s
          </Button>
        </div>
        
        {/* Next set info */}
        <AnimatePresence>
          {exerciseName && nextSet && !targetReached && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gray-800/50 rounded-lg p-3 mb-4 border border-gray-700/30"
            >
              <h4 className="font-medium text-sm text-gray-300 mb-2">Get Ready For:</h4>
              <div className="flex flex-col">
                <span className="text-purple-300 font-medium">{exerciseName}</span>
                <div className="flex items-center gap-2 mt-1 text-sm">
                  <span>Set {nextSet.set_number || "next"}:</span>
                  <span className={cn(
                    "font-medium",
                    recommendation && nextSet.weight !== recommendation.weight ? "text-green-400" : ""
                  )}>
                    {recommendation?.weight || nextSet.weight}kg
                  </span>
                  <span>×</span>
                  <span className={cn(
                    "font-medium",
                    recommendation && nextSet.reps !== recommendation.reps ? "text-green-400" : ""
                  )}>
                    {recommendation?.reps || nextSet.reps} reps
                  </span>
                </div>
                
                {recommendation?.message && (
                  <p className="text-xs text-gray-400 mt-2 italic">
                    {recommendation.message}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Motivational message */}
        <AnimatePresence>
          {(motivationalMessage || volumeStats) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-4 text-sm"
            >
              {motivationalMessage && (
                <p className="text-gray-300 mb-1">{motivationalMessage}</p>
              )}
              
              {volumeStats && (
                <p className="text-purple-400 font-medium">{volumeStats}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex justify-between gap-2">
          <Button 
            variant="outline" 
            className="flex-1 bg-gray-800 border-gray-700 hover:bg-gray-700"
            onClick={resetTimer}
          >
            Reset
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 bg-gray-800 border-gray-700 hover:bg-gray-700"
            onClick={toggleTimer}
          >
            {isActive ? 'Pause' : 'Resume'}
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 bg-gray-800 border-gray-700 hover:bg-gray-700"
            onClick={skipTimer}
          >
            <SkipForward size={16} className="mr-1" />
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedRestTimer;
