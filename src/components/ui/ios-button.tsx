
import * as React from "react";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/use-haptics";
import { Slot } from "@radix-ui/react-slot";

// Define iOS-style button variants
const iosButtonVariants = {
  filled: "bg-primary text-white font-medium active:bg-primary/90",
  tinted: "bg-primary/20 text-primary font-medium active:bg-primary/30",
  gray: "bg-gray-500/20 text-white font-medium active:bg-gray-500/30",
  plain: "text-primary font-medium",
  destructive: "bg-red-500 text-white font-medium active:bg-red-500/90"
};

// Define iOS-style button sizes
const iosButtonSizes = {
  large: "text-lg py-3 px-7 rounded-lg",
  medium: "text-base py-2.5 px-6 rounded-lg",
  small: "text-sm py-2 px-4 rounded-md",
  icon: "p-2 rounded-full"
};

export interface IOSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof iosButtonVariants;
  size?: keyof typeof iosButtonSizes;
  asChild?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  haptic?: boolean;
  hapticPattern?: Parameters<typeof useHaptics>['0']['triggerHaptic'][0];
}

const IOSButton = React.forwardRef<HTMLButtonElement, IOSButtonProps>(
  ({ 
    className, 
    variant = "filled", 
    size = "medium", 
    asChild = false, 
    iconLeft,
    iconRight,
    fullWidth = false,
    haptic = true,
    hapticPattern = "selection",
    children,
    onClick,
    disabled,
    ...props 
  }, ref) => {
    const { triggerHaptic } = useHaptics();
    const Comp = asChild ? Slot : "button";
    
    // Handle click with haptic feedback
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (haptic) {
        triggerHaptic(hapticPattern);
      }
      
      if (onClick) {
        onClick(e);
      }
    };
    
    return (
      <Comp
        className={cn(
          // Base button styles
          "inline-flex items-center justify-center transition-all duration-200 ease-out",
          // Apply variant and size
          iosButtonVariants[variant],
          iosButtonSizes[size],
          // iOS-style touch states
          "active:scale-[0.98] touch-callout-none",
          // Shadow effects for filled buttons
          variant === "filled" && "shadow-sm active:shadow-none",
          // Width control
          fullWidth ? "w-full" : "",
          // Disabled state
          disabled && "opacity-50 pointer-events-none",
          className
        )}
        ref={ref}
        onClick={handleClick}
        disabled={disabled}
        {...props}
      >
        {iconLeft && <span className="mr-2 -ml-1">{iconLeft}</span>}
        {children}
        {iconRight && <span className="ml-2 -mr-1">{iconRight}</span>}
      </Comp>
    );
  }
);

IOSButton.displayName = "IOSButton";

// Back button specifically designed for iOS-style navigation
const IOSBackButton = React.forwardRef<
  HTMLButtonElement, 
  Omit<IOSButtonProps, 'variant' | 'size' | 'children'> & { label?: string }
>(({ 
  className, 
  label = "Back",
  ...props 
}, ref) => {
  return (
    <IOSButton
      ref={ref}
      variant="plain"
      size="medium"
      className={cn(
        "pl-1 pr-3 -ml-1",
        className
      )}
      iconLeft={
        <svg width="12" height="21" viewBox="0 0 12 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.5 2L2 10.5L10.5 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      }
      {...props}
    >
      {label}
    </IOSButton>
  );
});

IOSBackButton.displayName = "IOSBackButton";

export { IOSButton, IOSBackButton };
