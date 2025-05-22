
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
  
  // Track scroll position for large title effect
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isLargeTitle, setIsLargeTitle] = useState(largeTitleOnScroll);
  
  // Handle scroll events to update header appearance
  useEffect(() => {
    if (!largeTitleOnScroll) return;
    
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
      setIsLargeTitle(position <= 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
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

  return (
    <>
      <header 
        className={cn(
          // Base positioning
          "fixed top-0 left-0 right-0 z-40",
          // Height and alignment - standardized to 64px on mobile for better touch
          "h-16 md:h-[60px] flex items-center",
          // Padding with safe area support
          "px-4 md:px-6 safe-top",
          // Visual styling with glass effect
          transparent ? "bg-transparent" : "bg-gray-900/95 backdrop-blur-md",
          // Border styling - adjusted to be more subtle
          !transparent && "border-b border-gray-800/50",
          // Shadow for depth - more refined iOS-like shadow
          !transparent && "shadow-sm shadow-black/10",
          // Transition for smooth scrolling effects
          "transition-all duration-300 ease-out",
          // Adjust height when using large title mode
          isLargeTitle && "h-24"
        )}
        style={{
          // Apply subtle gradient for more dimension
          background: transparent ? 'transparent' : 'linear-gradient(to bottom, rgba(17, 24, 39, 0.98), rgba(17, 24, 39, 0.94))'
        }}
      >
        <div className="flex-1 flex items-center min-w-0 gap-3">
          {showBackButton && (
            <button 
              onClick={handleBackWithFeedback}
              aria-label="Go back"
              className={cn(
                // Size increased for better touch targets with iOS standard
                "w-10 h-10 flex items-center justify-center rounded-full",
                // Visual feedback on touch that feels more iOS-like
                "-ml-2 active:bg-gray-800/50",
                // Transition for smooth interaction
                "transition-all duration-150 ease-out"
              )}
            >
              <ArrowLeft className="text-white" size={22} strokeWidth={2.5} />
            </button>
          )}
          
          <div className="flex flex-col">
            <h1 
              className={cn(
                // Dynamic title sizing
                isLargeTitle 
                  ? "text-2xl font-bold leading-tight transition-all duration-300" 
                  : "text-lg font-semibold leading-tight transition-all duration-300",
                theme.textStyles.headings.primary,
                "truncate max-w-[200px] sm:max-w-xs"
              )}
            >
              {title}
            </h1>
            
            {subtitle && (
              <p className={cn(
                "text-xs text-white/60 truncate",
                isLargeTitle ? "opacity-100" : "opacity-0 h-0",
                "transition-all duration-300"
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
      
      {/* Spacer element to push content below header */}
      <div className={isLargeTitle ? "h-24" : "h-16"} />
      
      {/* Large title container that appears on scroll */}
      {largeTitleOnScroll && (
        <div 
          className={cn(
            "px-4 md:px-6 pb-2 pt-4",
            "transition-all duration-300 ease-out",
            scrollPosition > 50 ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
          )}
        >
          <h1 className="text-3xl font-bold">
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
