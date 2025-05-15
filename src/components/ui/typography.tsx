
import React from 'react';
import { cn } from '@/lib/utils';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: keyof typeof typographyVariants;
  as?: React.ElementType;
  children?: React.ReactNode;
}

export const typographyVariants = {
  h1: "text-4xl font-extrabold tracking-tight lg:text-5xl",
  h2: "text-3xl font-semibold tracking-tight",
  h3: "text-2xl font-semibold",
  h4: "text-xl font-semibold",
  p: "leading-7",
  lead: "text-xl text-gray-300",
  large: "text-lg font-semibold",
  small: "text-sm font-medium leading-none",
  muted: "text-sm text-gray-500 dark:text-gray-400",
  subtle: "text-gray-400 dark:text-gray-500",
};

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant = "p", as, children, ...props }, ref) => {
    const Component = as || (
      variant === "h1" || variant === "h2" || variant === "h3" || variant === "h4" 
        ? variant 
        : "p"
    );
    
    return (
      <Component
        className={cn(typographyVariants[variant], className)}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = "Typography";

// Export commonly used typography styles for direct use
export const typography = {
  text: {
    primary: "text-white font-medium leading-normal",
    secondary: "text-gray-400 text-sm leading-relaxed",
    muted: "text-gray-500 text-xs",
    accent: "text-purple-400 font-medium",
    error: "text-red-400 text-sm",
    success: "text-green-400 text-sm",
  },
  heading: {
    h1: typographyVariants.h1,
    h2: typographyVariants.h2,
    h3: typographyVariants.h3,
    h4: typographyVariants.h4,
    large: "text-2xl font-bold tracking-tight md:text-3xl",
    medium: "text-xl font-semibold tracking-tight md:text-2xl",
    small: "text-lg font-semibold tracking-tight md:text-xl",
  }
};
