
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
  // If asChild is false, render as a normal button wrapper
  if (!asChild) {
    return (
      <TooltipTrigger className={className}>
        {children}
      </TooltipTrigger>
    );
  }
  
  // For asChild=true, we need to be very careful about what we pass
  
  // Case 1: Handle null, undefined or empty children
  if (!children) {
    return null;
  }
  
  // Case 2: Handle text nodes, numbers, or other primitive values
  if (typeof children === 'string' || typeof children === 'number' || typeof children === 'boolean') {
    return (
      <TooltipTrigger asChild>
        <span className={className}>{children}</span>
      </TooltipTrigger>
    );
  }
  
  // Case 3: Handle arrays or fragments
  const childArray = React.Children.toArray(children);
  
  // If there are multiple children or fragments, wrap in a span
  if (childArray.length !== 1) {
    return (
      <TooltipTrigger asChild>
        <span className={className}>{children}</span>
      </TooltipTrigger>
    );
  }
  
  // Case 4: Handle a single React element
  const singleChild = childArray[0];
  
  if (!React.isValidElement(singleChild)) {
    // If it's not a valid React element, wrap it
    return (
      <TooltipTrigger asChild>
        <span className={className}>{singleChild}</span>
      </TooltipTrigger>
    );
  }
  
  // Case 5: It's a valid React element, merge the className if possible
  try {
    // Type guards to ensure we can safely clone the element
    if (className && React.isValidElement(singleChild)) {
      const existingClassName = (singleChild.props as any).className || '';
      const mergedClassName = existingClassName ? `${existingClassName} ${className}`.trim() : className;
      
      const clonedChild = React.cloneElement(
        singleChild,
        {
          ...(singleChild.props || {}),
          className: mergedClassName,
        }
      );
      
      return <TooltipTrigger asChild>{clonedChild}</TooltipTrigger>;
    }
  } catch (error) {
    // Fallback if cloning fails
    console.error("Error in TooltipWrapper:", error);
    return (
      <TooltipTrigger asChild>
        <span className={className}>{singleChild}</span>
      </TooltipTrigger>
    );
  }
  
  // Default case: Just pass the single child directly
  return <TooltipTrigger asChild>{singleChild}</TooltipTrigger>;
};
