
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
  // If asChild is true, we need to wrap the children in a div to ensure React.Children.only receives one child
  if (asChild) {
    return (
      <TooltipTrigger asChild>
        <div className={className}>
          {children}
        </div>
      </TooltipTrigger>
    );
  }
  
  // If asChild is false, we can pass the children directly
  return <TooltipTrigger className={className}>{children}</TooltipTrigger>;
};
