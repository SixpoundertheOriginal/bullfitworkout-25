
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
    // When asChild is true, we should pass the child directly to TooltipTrigger
    // without wrapping it in a div, as this will cause the React.Children.only error
    return <TooltipTrigger asChild>{children}</TooltipTrigger>;
  }
  
  // If asChild is false, we just pass children directly
  return <TooltipTrigger className={className}>{children}</TooltipTrigger>;
}
