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
  
  // Add haptic feedback function for navigation
  const handleNavigation = (path: string) => {
    if ('vibrate' in navigator) {
      // Light haptic feedback
      navigator.vibrate(3);
    }
    confirmNavigation(path);
  };
  
  return (
    <nav 
      className={cn(
        // Base styling - enhanced for persistent visibility
        "h-16 w-full",
        // Visual styling with glass effect - strengthened for fixed positioning
        "bg-gray-900/98 backdrop-blur-lg",
        // Border styling - more visible top border for better separation
        "border-t border-gray-800/70",
        // Shadow for depth - upward shadow to separate from content
        "shadow-lg shadow-black/40",
        // Safe area insets - improved safe-bottom handling
        "safe-bottom",
      )}
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
        // Base styles
        "flex flex-col items-center justify-center",
        // Full height for the button
        "h-full w-full",
        // Touch interaction enhancements - increased touchable area
        "tap-highlight-transparent touch-feedback active:bg-gray-800/30",
        // Color based on state
        active ? "text-white" : "text-gray-500",
        // Transition for smooth state changes
        "transition-colors duration-200",
        // Relative positioning for the highlight badge
        highlight ? "relative" : ''
      )}
    >
      <div className={cn(
        "flex items-center justify-center",
        active ? "scale-110 transition-transform duration-200" : ""
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-xs mt-1",
        active ? "font-medium" : "",
        theme.textStyles.text.small
      )}>
        {label}
      </span>
      {highlight && (
        <span className={cn(
          "absolute top-2 right-1/4",
          "h-2 w-2 rounded-full",
          "bg-green-500",
          "animate-pulse-slow"
        )}></span>
      )}
    </button>
  );
};
