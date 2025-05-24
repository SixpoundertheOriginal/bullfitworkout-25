
import { Clock, User as UserIcon, Dumbbell, BarChart3, Zap } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useWorkoutNavigation } from "@/context/WorkoutNavigationContext";
import { useWorkoutState } from "@/hooks/useWorkoutState";
import { cn } from "@/lib/utils";
import { theme } from "@/lib/theme";

export const BottomNav = () => {
  const location = useLocation();
  const { confirmNavigation } = useWorkoutNavigation();
  const { exercises, elapsedTime } = useWorkoutState();
  
  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path === "/overview" && location.pathname === "/overview") return true;
    if (path === "/training-session" && location.pathname === "/training-session") return true;
    if (path === "/workouts" && location.pathname === "/workouts") return true;
    if (path === "/profile" && location.pathname === "/profile") return true;
    if (path === "/all-exercises" && location.pathname === "/all-exercises") return true;
    return false;
  };
  
  const isWorkoutActive = Object.keys(exercises).length > 0 && elapsedTime > 0;
  
  // Prevent showing bottom nav on dialog or auth page
  const isDialogOpen = document.querySelector('[role="dialog"]') !== null;
  const isAuthPage = location.pathname === '/auth';
  
  if (isDialogOpen || isAuthPage) {
    return null;
  }
  
  // Enhanced haptic feedback for iOS-like navigation
  const handleNavigation = (path: string) => {
    if ('vibrate' in navigator) {
      // Light haptic feedback matching iOS selection feedback
      navigator.vibrate(10);
    }
    confirmNavigation(path);
  };
  
  return (
    <nav 
      className={cn(
        // Fixed positioning for true sticky behavior
        "fixed bottom-0 left-0 right-0 z-50",
        // Enhanced height with proper safe area handling
        "h-16 w-full",
        // iOS-style backdrop with enhanced blur effect
        "bg-gray-900/95 backdrop-blur-2xl",
        // Enhanced border with better visibility
        "border-t border-gray-800/60",
        // iOS-style shadow with multiple layers for depth
        "shadow-2xl shadow-black/30",
        // Safe area insets with improved bottom padding for home indicator
        "pb-safe-area-inset-bottom",
        // GPU acceleration for smooth scrolling performance
        "will-change-transform",
      )}
      style={{
        // Enhanced gradient background for better visual separation
        background: 'linear-gradient(to top, rgba(17, 24, 39, 0.98), rgba(17, 24, 39, 0.95))',
        // Stronger backdrop blur for content behind footer
        backdropFilter: 'blur(20px)',
        // Enhanced box shadow with multiple layers
        boxShadow: `
          0 -2px 8px rgba(0, 0, 0, 0.1),
          0 -8px 16px rgba(0, 0, 0, 0.15),
          0 -16px 24px rgba(0, 0, 0, 0.1)
        `
      }}
    >
      <div className="grid grid-cols-5 h-full">
        <NavButton 
          icon={<Clock size={24} />} 
          label="Home" 
          active={isActive('/')} 
          onClick={() => handleNavigation('/')} 
        />
        <NavButton 
          icon={<BarChart3 size={24} />} 
          label="Overview" 
          active={isActive('/overview')}
          onClick={() => handleNavigation('/overview')} 
        />
        <NavButton 
          icon={<Zap size={24} strokeWidth={2.5} />} 
          label="Training"
          active={isActive('/training-session')}
          onClick={() => handleNavigation('/training-session')}
          highlight={isWorkoutActive}
        />
        <NavButton 
          icon={<Dumbbell size={24} />} 
          label="Exercises"
          active={isActive('/all-exercises')}
          onClick={() => handleNavigation('/all-exercises')}
        />
        <NavButton 
          icon={<UserIcon size={24} />} 
          label="Profile" 
          active={isActive('/profile')}
          onClick={() => handleNavigation('/profile')} 
        />
      </div>
    </nav>
  );
};

const NavButton = ({ 
  icon, 
  label, 
  active = false, 
  onClick,
  highlight = false
}: { 
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  highlight?: boolean;
}) => {
  return (
    <button 
      onClick={onClick} 
      aria-label={label}
      className={cn(
        // Base styles with enhanced touch targets
        "flex flex-col items-center justify-center",
        // Full height and width for maximum touch area
        "h-full w-full",
        // Enhanced touch interaction with iOS-style feedback
        "tap-highlight-transparent touch-manipulation",
        // iOS-style active state with scale animation
        "active:scale-95 active:bg-gray-800/40",
        // Color states with enhanced contrast
        active ? "text-white" : "text-gray-400",
        // Enhanced transitions for smooth interactions
        "transition-all duration-200 ease-out",
        // Relative positioning for highlight badge
        highlight ? "relative" : ''
      )}
    >
      <div className={cn(
        "flex items-center justify-center",
        // Enhanced scale animation for active state
        active ? "scale-110 transition-transform duration-300 ease-out" : "transition-transform duration-200 ease-out"
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-xs mt-1",
        // Enhanced font weight for active state
        active ? "font-semibold" : "font-medium",
        theme.textStyles.text.small
      )}>
        {label}
      </span>
      {highlight && (
        <span className={cn(
          "absolute top-2 right-1/4",
          "h-2 w-2 rounded-full",
          // Enhanced highlight color with pulsing animation
          "bg-green-400",
          "animate-pulse-slow",
          // Add a subtle glow effect
          "shadow-lg shadow-green-400/50"
        )}></span>
      )}
    </button>
  );
};
