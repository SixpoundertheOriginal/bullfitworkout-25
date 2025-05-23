
import React from "react";
import { TooltipTrigger } from "./tooltip";

interface TooltipWrapperProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

/**
 * A helper component to properly wrap tooltip triggers.
 * This component ensures we always provide a single valid React element to TooltipTrigger.
 */
export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  asChild = true,
  className = "",
}) => {
  // If asChild is false, just use the built-in TooltipTrigger behavior
  if (!asChild) {
    return <TooltipTrigger className={className}>{children}</TooltipTrigger>;
  }

  // For asChild=true, we need to handle the children carefully
  
  // Check if children is a single valid React element
  const isSingleValidElement = 
    React.isValidElement(children) && 
    !Array.isArray(children) && 
    React.Children.count(children) === 1;
  
  // If it's a single valid element, we can use asChild with it directly
  if (isSingleValidElement) {
    return <TooltipTrigger asChild>{children}</TooltipTrigger>;
  }
  
  // For any other case (text, multiple children, etc.), wrap in a span
  return (
    <TooltipTrigger asChild>
      <span className={className}>{children}</span>
    </TooltipTrigger>
  );
};
