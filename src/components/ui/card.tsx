
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Base styles
      "rounded-xl border shadow-sm backdrop-blur-sm",
      // Enhanced glass effect with more subtle colors
      "bg-gray-900/80 text-white/95 border-gray-800/40",
      // iOS-style hover effect with subtle scaling
      "hover:bg-gray-900/90 transition-all duration-300 ease-out",
      // Dark mode styles with improved contrast
      "dark:bg-[#1A1F2C]/90 dark:border-gray-700/40",
      // Animation improvements
      "motion-safe:hover:scale-[1.01] motion-safe:active:scale-[0.98]",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6",
      "transition-transform duration-200", 
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      "text-white/95",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-white/60 leading-relaxed",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "p-6 pt-0",
      "transition-opacity duration-200",
      className
    )} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0",
      "border-t border-gray-800/20 mt-4",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// New component: Card with iOS-style animation
const AnimatedCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      "transform transition-all duration-300 ease-out",
      "hover:translate-y-[-2px] hover:shadow-lg",
      "active:translate-y-[1px] active:shadow-md",
      "motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]",
      className
    )}
    {...props}
  />
))
AnimatedCard.displayName = "AnimatedCard"

// New component: Interactive card with haptic feedback
const InteractiveCard = ({ 
  onPress, 
  hapticFeedback = true,
  pressAnimationScale = 0.98,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { 
  onPress?: () => void;
  hapticFeedback?: boolean;
  pressAnimationScale?: number;
}) => {
  // Track press state
  const [isPressed, setIsPressed] = React.useState(false);
  
  // Handle touch events
  const handleTouchStart = () => {
    setIsPressed(true);
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(5);
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPressed(false);
    if (onPress) {
      e.preventDefault();
      onPress();
    }
  };
  
  return (
    <Card
      {...props}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => setIsPressed(false)}
      style={{
        transform: isPressed ? `scale(${pressAnimationScale})` : 'scale(1)',
        transition: 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
    />
  );
};

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  AnimatedCard,
  InteractiveCard
}
