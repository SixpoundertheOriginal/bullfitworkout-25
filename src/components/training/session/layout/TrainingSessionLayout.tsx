
import React, { useEffect } from 'react';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { useHaptics } from '@/hooks/use-haptics';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export interface TrainingSessionLayoutProps {
  children: React.ReactNode;
  onSwipeBack?: () => void;
  showBackButton?: boolean;
  fullScreenMode?: boolean;
}

export const TrainingSessionLayout: React.FC<TrainingSessionLayoutProps> = ({ 
  children,
  onSwipeBack,
  showBackButton = true,
  fullScreenMode = false 
}) => {
  const navigate = useNavigate();
  const { triggerHaptic } = useHaptics();
  
  // Handle back gesture navigation
  const handleSwipeRight = () => {
    if (onSwipeBack) {
      triggerHaptic('selection');
      onSwipeBack();
    } else {
      triggerHaptic('selection');
      navigate(-1);
    }
  };
  
  // Set up touch gestures for iOS-style navigation
  const { ref } = useTouchGestures({
    onSwipeRight: handleSwipeRight,
    threshold: 80,
  });
  
  // Lock screen orientation to portrait for training sessions
  useEffect(() => {
    // Check if the Screen Orientation API is available
    if (typeof screen !== 'undefined' && screen.orientation) {
      try {
        // Use type assertion to access the lock method
        (screen.orientation as any).lock('portrait').catch(err => {
          console.log('Orientation lock not supported:', err);
        });
      } catch (err) {
        console.log('Orientation API not supported');
      }
    }
    
    return () => {
      // Unlock orientation when unmounting
      if (typeof screen !== 'undefined' && screen.orientation) {
        try {
          // Use type assertion for unlock as well
          (screen.orientation as any).unlock();
        } catch (err) {
          console.log('Failed to unlock orientation');
        }
      }
    };
  }, []);
  
  return (
    <div 
      ref={ref}
      className={cn(
        "flex flex-col min-h-screen bg-black/95 text-white",
        // iOS-style padding adjustments
        fullScreenMode ? "pt-0" : "pt-16 safe-top",
        "pb-20 safe-bottom",
        // Animation for entering the training mode
        "animate-in fade-in duration-300"
      )}
    >
      <main className="flex-1 overflow-auto px-4 -mx-0.5">
        <div className="container max-w-5xl mx-auto">
          <div className="h-full flex flex-col">
            {/* Handle area for iOS-style swipe indicator when in full screen mode */}
            {fullScreenMode && (
              <div className="flex justify-center py-2 -mt-1">
                <div className="w-10 h-1 bg-white/20 rounded-full" />
              </div>
            )}
          
            {children}
          </div>
        </div>
      </main>
      
      {/* iOS-style home indicator area padding at bottom */}
      <div className="h-safe-bottom" />
    </div>
  );
};
