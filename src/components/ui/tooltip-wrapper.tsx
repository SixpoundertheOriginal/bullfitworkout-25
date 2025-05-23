
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
  // For the non-asChild case, we can just render the TooltipTrigger normally
  if (!asChild) {
    return <TooltipTrigger className={className}>{children}</TooltipTrigger>;
  }
  
  // For asChild=true case, we need special handling
  
  // If we have a single valid React element, pass it directly to avoid wrapper elements
  if (
    React.isValidElement(children) && 
    !Array.isArray(children) && 
    React.Children.count(children) === 1
  ) {
    // This is safe because we've verified that children is a single valid element
    return <TooltipTrigger asChild>{children}</TooltipTrigger>;
  }
  
  // For any other case (text nodes, multiple children, etc.)
  // we must wrap in a single element to satisfy React.Children.only()
  return (
    <TooltipTrigger asChild>
      <span className={className}>{children}</span>
    </TooltipTrigger>
  );
};
