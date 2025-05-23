
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
    // When using asChild, we must ensure children is a single React element
    // React.Children.only will throw an error if children is not exactly one element
    
    // If children is an array or fragment, this will cause React.Children.only to throw
    // So we need to make sure we're passing exactly one React element
    if (React.Children.count(children) !== 1) {
      // If we have multiple children or no children, wrap in a span
      return (
        <TooltipTrigger asChild>
          <span className={className}>{children}</span>
        </TooltipTrigger>
      );
    }
    
    // We have exactly one child, so we can safely use asChild
    return <TooltipTrigger asChild>{children}</TooltipTrigger>;
  }
  
  // If asChild is false, we just pass children directly
  return <TooltipTrigger className={className}>{children}</TooltipTrigger>;
}
