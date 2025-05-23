
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
    return (
      <TooltipTrigger asChild>
        <span className={className} />
      </TooltipTrigger>
    );
  }
  
  // Case 2: Handle text nodes, numbers, or other primitive values
  if (typeof children === 'string' || typeof children === 'number' || typeof children === 'boolean') {
    return (
      <TooltipTrigger asChild>
        <span className={className}>{children}</span>
      </TooltipTrigger>
    );
  }
  
  // Case 3: Convert children to array and handle multiple children
  const childArray = React.Children.toArray(children).filter(Boolean);
  
  // If there are no valid children after filtering
  if (childArray.length === 0) {
    return (
      <TooltipTrigger asChild>
        <span className={className} />
      </TooltipTrigger>
    );
  }
  
  // If there are multiple children, wrap them in a span
  if (childArray.length > 1) {
    return (
      <TooltipTrigger asChild>
        <span className={className}>{children}</span>
      </TooltipTrigger>
    );
  }
  
  // Case 4: Handle a single child
  const singleChild = childArray[0];
  
  // If it's not a valid React element, wrap it
  if (!React.isValidElement(singleChild)) {
    return (
      <TooltipTrigger asChild>
        <span className={className}>{singleChild}</span>
      </TooltipTrigger>
    );
  }
  
  // Case 5: It's a valid React element, try to merge className
  if (className) {
    try {
      // Check if the element accepts className prop
      const props = singleChild.props as any;
      const existingClassName = props?.className || '';
      const mergedClassName = existingClassName ? `${existingClassName} ${className}`.trim() : className;
      
      // Clone the element with merged className
      const clonedChild = React.cloneElement(
        singleChild,
        {
          ...props,
          className: mergedClassName,
        }
      );
      
      return <TooltipTrigger asChild>{clonedChild}</TooltipTrigger>;
    } catch (error) {
      // If cloning fails, wrap in span as fallback
      console.error("Error cloning element in TooltipWrapper:", error);
      return (
        <TooltipTrigger asChild>
          <span className={className}>{singleChild}</span>
        </TooltipTrigger>
      );
    }
  }
  
  // Default case: Just pass the single valid React element
  return <TooltipTrigger asChild>{singleChild}</TooltipTrigger>;
};
