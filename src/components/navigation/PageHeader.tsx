
import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { theme } from "@/lib/theme";
import { useHaptics } from "@/hooks/use-haptics";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  children?: React.ReactNode;
  transparent?: boolean;
  largeTitleOnScroll?: boolean;
  subtitle?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  showBackButton = false, 
  onBack,
  children,
  transparent = false,
  largeTitleOnScroll = false,
  subtitle
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { triggerHaptic } = useHaptics();
  
  // Track scroll position for dynamic effects
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isLargeTitle, setIsLargeTitle] = useState(largeTitleOnScroll);
  
  // Handle scroll events for iOS-style dynamic header
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
      if (largeTitleOnScroll) {
        setIsLargeTitle(position <= 50);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [largeTitleOnScroll]);
  
  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // Handle back with haptic feedback
  const handleBackWithFeedback = () => {
    triggerHaptic('selection');
    handleBack();
  };

  // Calculate dynamic blur and shadow based on scroll position
  const blurIntensity = Math.min(scrollPosition / 50, 1);
  const shadowIntensity = Math.min(scrollPosition / 30, 1);

  return (
    <>
      <header 
        className={cn(
          // Base styling with enhanced positioning
          "fixed top-0 left-0 right-0 z-50 w-full",
          // Dynamic height with iOS standards - 44pt base + safe area
          "h-16 md:h-[60px] flex items-center",
          // Enhanced padding with safe area support
          "px-4 md:px-6",
          // iOS-style safe area handling for devices with notches
          "pt-safe-area-inset-top",
          // Dynamic background with enhanced blur effect
          transparent ? "bg-transparent" : cn(
            "bg-gray-900/95 backdrop-blur-xl",
            scrollPosition > 10 && "bg-gray-900/98 backdrop-blur-2xl"
          ),
          // Dynamic border with scroll-based opacity
          !transparent && cn(
            "border-b border-gray-800/30",
            scrollPosition > 10 && "border-gray-800/60"
          ),
          // Enhanced shadow system that appears on scroll
          !transparent && cn(
            "shadow-sm shadow-black/5",
            scrollPosition > 10 && "shadow-lg shadow-black/25"
          ),
          // Smooth transitions for all dynamic properties
          "transition-all duration-300 ease-out",
          // GPU acceleration for better performance
          "will-change-transform",
          // Adjust height when using large title mode
          isLargeTitle && "h-20"
        )}
        style={{
          // Enhanced gradient with dynamic opacity based on scroll
          background: transparent ? 'transparent' : 
            `linear-gradient(to bottom, 
              rgba(17, 24, 39, ${0.95 + (blurIntensity * 0.05)}), 
              rgba(17, 24, 39, ${0.92 + (blurIntensity * 0.06)})
            )`,
          // Dynamic backdrop blur intensity
          backdropFilter: transparent ? 'none' : `blur(${12 + (blurIntensity * 8)}px)`,
          // Dynamic box shadow
          boxShadow: transparent ? 'none' : 
            `0 ${2 + (shadowIntensity * 8)}px ${12 + (shadowIntensity * 12)}px rgba(0, 0, 0, ${0.1 + (shadowIntensity * 0.15)})`
        }}
      >
        <div className="flex-1 flex items-center min-w-0 gap-3">
          {showBackButton && (
            <button 
              onClick={handleBackWithFeedback}
              aria-label="Go back"
              className={cn(
                // Enhanced touch target size for iOS standards (44pt minimum)
                "w-11 h-11 flex items-center justify-center rounded-full",
                // iOS-style interactive states with proper feedback
                "-ml-2 active:bg-gray-800/40 active:scale-95",
                // Enhanced transitions for smooth interactions
                "transition-all duration-150 ease-out",
                // Touch manipulation for better responsiveness
                "touch-manipulation"
              )}
            >
              <ArrowLeft className="text-white" size={22} strokeWidth={2.5} />
            </button>
          )}
          
          <div className="flex flex-col">
            <h1 
              className={cn(
                // Dynamic title sizing with smooth transitions
                isLargeTitle 
                  ? "text-2xl font-bold leading-tight" 
                  : "text-lg font-semibold leading-tight",
                "transition-all duration-300 ease-out",
                theme.textStyles.headings.primary,
                "truncate max-w-[200px] sm:max-w-xs"
              )}
              style={{
                // iOS-style font weight adjustment
                fontWeight: isLargeTitle ? 700 : 600
              }}
            >
              {title}
            </h1>
            
            {subtitle && (
              <p className={cn(
                "text-xs text-white/60 truncate",
                isLargeTitle ? "opacity-100 mt-1" : "opacity-0 h-0",
                "transition-all duration-300 ease-out"
              )}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {children && (
          <div className={cn(
            "flex items-center space-x-3",
            "animate-in fade-in slide-in-from-right duration-300"
          )}>
            {children}
          </div>
        )}
      </header>
      
      {/* Large title container for scroll-based animations */}
      {largeTitleOnScroll && (
        <div 
          className={cn(
            "fixed top-16 left-0 right-0 z-40",
            "px-4 md:px-6 pb-3 pt-2",
            "bg-gray-900/90 backdrop-blur-md",
            "transition-all duration-300 ease-out",
            scrollPosition > 50 ? "opacity-0 transform translate-y-[-100%] pointer-events-none" : "opacity-100 transform translate-y-0"
          )}
        >
          <h1 className="text-3xl font-bold text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/70 text-sm mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </>
  );
};
