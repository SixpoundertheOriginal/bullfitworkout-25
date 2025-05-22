
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useHaptics, HapticPattern } from "@/hooks/use-haptics"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-montserrat font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "btn btn-primary",
        destructive: "bg-negative text-white hover:bg-negative/90 shadow-sm",
        outline: "btn btn-outline",
        secondary: "btn btn-secondary",
        ghost: "btn btn-ghost",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:scale-105",
        "icon-circle": "rounded-full bg-gradient-to-br shadow-lg transition-all duration-300 hover:scale-105 focus:ring-offset-background",
        "nav-action": "bg-gradient-to-r from-primary to-secondary text-white font-semibold tracking-wide hover:from-primary/80 hover:to-secondary/80 shadow-lg hover:shadow-primary/25 border border-white/10",
        // iOS-style button variants
        "ios-filled": "bg-primary text-white font-medium rounded-lg active:bg-primary/90 shadow-sm active:shadow-none",
        "ios-tinted": "bg-primary/20 text-primary font-medium rounded-lg active:bg-primary/30",
        "ios-gray": "bg-gray-500/20 text-white font-medium rounded-lg active:bg-gray-500/30",
        "ios-plain": "text-primary font-medium",
        "ios-destructive": "bg-red-500 text-white font-medium rounded-lg active:bg-red-500/90 shadow-sm active:shadow-none",
      },
      shape: {
        default: "rounded-md",
        pill: "rounded-full",
        square: "rounded-none",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-md px-3 text-sm",
        lg: "h-14 rounded-md px-8 text-lg",
        icon: "h-11 w-11 p-2",
        "icon-lg": "h-16 w-16 p-4",
        // iOS-style button sizes
        "ios-large": "text-lg py-3 px-7",
        "ios-medium": "text-base py-2.5 px-6",
        "ios-small": "text-sm py-2 px-4",
        "ios-icon": "p-2 aspect-square",
      },
      iconPosition: {
        left: "[&_svg]:ml-0 [&_svg]:mr-2",
        right: "[&_svg]:ml-2 [&_svg]:mr-0",
        none: "",
      },
      // iOS-specific animation styles
      iosAnimation: {
        default: "active:scale-[0.98]", 
        subtle: "active:scale-[0.995]",
        none: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
      iconPosition: "left",
      iosAnimation: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  icon?: React.ReactNode
  iconOnly?: boolean
  haptic?: boolean
  hapticPattern?: HapticPattern
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    shape, 
    iconPosition, 
    iosAnimation,
    icon, 
    children, 
    iconOnly = false, 
    asChild = false,
    haptic = true,
    hapticPattern = 'selection',
    onClick,
    ...props 
  }, ref) => {
    const { triggerHaptic } = useHaptics();
    const Comp = asChild ? Slot : "button"
    const effectiveSize = iconOnly ? (size === "lg" ? "icon-lg" : "icon") : size
    const effectiveIconPosition = iconOnly ? "none" : iconPosition

    // Handle click with haptic feedback
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (haptic && !props.disabled) {
        triggerHaptic(hapticPattern);
      }
      
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <Comp
        className={cn(
          buttonVariants({ 
            variant, 
            size: effectiveSize, 
            shape,
            iconPosition: effectiveIconPosition,
            iosAnimation,
            className 
          }),
          "transition-all duration-200 ease-out touch-callout-none",
          props.disabled && "btn-disabled opacity-50"
        )}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {icon}
        {!iconOnly && children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
