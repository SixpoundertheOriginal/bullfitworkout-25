
import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { theme } from "@/lib/theme";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  showBackButton = false, 
  onBack,
  children
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // Add haptic feedback for iOS devices when back button is pressed
  const handleBackWithFeedback = () => {
    if ('vibrate' in navigator) {
      // Light haptic feedback
      navigator.vibrate(5);
    }
    handleBack();
  };

  return (
    <header 
      className={cn(
        // Base positioning
        "fixed top-0 left-0 right-0 z-10",
        // Height and alignment - standardized to 64px on mobile for better touch
        "h-16 md:h-[60px] flex items-center",
        // Padding with safe area support
        "px-4 md:px-6 safe-top",
        // Visual styling with glass effect
        "bg-gray-900/95 backdrop-blur-md",
        // Border styling
        "border-b border-gray-800/50",
        // Shadow for depth
        "shadow-sm shadow-black/20"
      )}
    >
      <div className="flex-1 flex items-center min-w-0 gap-3">
        {showBackButton && (
          <button 
            onClick={handleBackWithFeedback}
            aria-label="Go back"
            className={cn(
              // Size increased for better touch targets
              "w-12 h-12 flex items-center justify-center rounded-full",
              // Visual feedback on touch
              "-ml-3 active:bg-gray-800/50",
              // Transition for smooth interaction
              "transition-colors duration-200"
            )}
          >
            <ArrowLeft size={24} />
          </button>
        )}
        <h1 className={cn(
          "text-xl font-bold truncate",
          theme.textStyles.headings.primary
        )}>{title}</h1>
      </div>
      {children && (
        <div className="flex items-center space-x-2">
          {children}
        </div>
      )}
    </header>
  );
};
