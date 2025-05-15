
import React, { useEffect, useRef, useState } from "react";
import { CircularProgress } from "./ui/circular-progress";
import { Timer, Play, Pause, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface RestTimerControlsProps {
  elapsedTime: number;
  maxTime: number;
  isActive: boolean;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkip: () => void;
  className?: string;
  compact?: boolean;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const RestTimerControls = ({
  elapsedTime,
  maxTime,
  isActive,
  onPause,
  onResume,
  onReset,
  onSkip,
  className = "",
  compact = false,
}: RestTimerControlsProps) => {
  const progress = Math.min((elapsedTime / maxTime) * 100, 100);
  const toastObserverRef = useRef<MutationObserver | null>(null);
  const [timerFinished, setTimerFinished] = useState(false);
  
  useEffect(() => {
    if (elapsedTime >= maxTime && !timerFinished) {
      setTimerFinished(true);
      // Only show toast if timer has completed naturally
      toast.success("Rest completed! Ready for your next set.", {
        duration: 2000
      });
    } else if (elapsedTime < maxTime && timerFinished) {
      setTimerFinished(false);
    }
  }, [elapsedTime, maxTime, timerFinished]);
  
  useEffect(() => {
    console.log("RestTimerControls useEffect:", { elapsedTime, isActive, progress });
    
    // Listen for toast events to reset timer
    const resetOnToast = () => {
      console.log("RestTimerControls: Toast detected, resetting timer");
      if (isActive) {
        onReset();
      }
    };
    
    // Create a MutationObserver to watch for toast elements
    if (!toastObserverRef.current) {
      toastObserverRef.current = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof HTMLElement && 
                  (node.classList.contains('toast') || 
                   node.getAttribute('role') === 'status' || 
                   node.getAttribute('data-sonner-toast') === 'true')) {
                if (node.textContent && node.textContent.includes("logged successfully")) {
                  resetOnToast();
                }
              }
            });
          }
        });
      });
      
      // Start observing the document body
      toastObserverRef.current.observe(document.body, { childList: true, subtree: true });
    }
    
    return () => {
      if (toastObserverRef.current) {
        toastObserverRef.current.disconnect();
        toastObserverRef.current = null;
      }
    };
  }, [elapsedTime, isActive, progress, onReset]);
  
  console.log("RestTimerControls rendered:", { elapsedTime, isActive, progress });

  if (compact) {
    return (
      <div className={cn(
        "flex flex-col items-center gap-1", 
        "transition-all duration-300",
        progress > 95 ? "scale-105" : "",
        className
      )}>
        <Timer size={20} className={cn(
          "text-purple-400 mb-1",
          isActive && "animate-pulse"
        )} />
        <span className={cn(
          "text-lg font-mono text-white",
          progress > 95 && "text-orange-400 font-bold scale-110 transition-all duration-300"
        )}>
          {formatTime(elapsedTime)}
        </span>
        <span className="text-xs text-gray-400 font-medium">Rest</span>
        {!isActive && (
          <Button
            variant="outline"
            size="sm"
            className="mt-1 bg-gray-800/50 border-gray-700 hover:bg-gray-700 text-white"
            onClick={() => {
              onResume();
              onReset(); // Reset the timer when manually started
            }}
          >
            <Play size={14} className="mr-1" /> Start
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-4",
      "transition-all duration-300",
      progress > 95 ? "scale-105" : "",
      className
    )}>
      <div className="relative flex items-center justify-center">
        <CircularProgress 
          value={progress} 
          className={cn(
            "w-16 h-16", 
            "[&>circle]:text-purple-500/20", 
            progress > 95 
              ? "[&>circle:last-child]:text-orange-500 [&>circle:last-child]:stroke-[4]" 
              : "[&>circle:last-child]:text-purple-500"
          )} 
        />
        <span className={cn(
          "absolute font-mono text-white text-sm",
          progress > 95 && "text-orange-400 font-bold scale-110 transition-all duration-300"
        )}>
          {formatTime(elapsedTime)}
        </span>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline" 
          size="icon"
          className={cn(
            "bg-gray-800/50 border-gray-700 hover:bg-gray-700 text-white",
            "transition-all duration-200",
            isActive ? "bg-purple-900/20" : ""
          )}
          onClick={() => {
            if (isActive) {
              onPause();
            } else {
              onResume();
              onReset(); // Reset the timer when manually started
            }
          }}
        >
          {isActive ? <Pause size={18} /> : <Play size={18} />}
        </Button>
        <Button
          variant="outline"
          size="icon" 
          className="bg-gray-800/50 border-gray-700 hover:bg-gray-700 text-white"
          onClick={onSkip}
        >
          <SkipForward size={18} />
        </Button>
      </div>
    </div>
  );
};
