
import React from "react";
import { TooltipTrigger } from "./tooltip";

interface TooltipWrapperProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

/**
 * A helper component to properly wrap tooltip triggers.
 * This ensures we always provide a single child to React.Children.only.
 */
export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  asChild = true,
  className = "",
}) => {
  // If asChild is true, we need to ensure we're passing a single element to TooltipTrigger
  if (asChild) {
    return (
      <TooltipTrigger asChild>
        {/* Ensure we have exactly one child element by wrapping in a single div */}
        <div className={className}>
          {children}
        </div>
      </TooltipTrigger>
    );
  }
  
  // If asChild is false, we just pass children directly (TooltipTrigger handles this case)
  return <TooltipTrigger className={className}>{children}</TooltipTrigger>;
};
