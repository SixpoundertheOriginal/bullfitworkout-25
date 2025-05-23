
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
  // Let's be more defensive and check multiple conditions
  
  // First, check if children is null, undefined, or empty
  if (!children) {
    return (
      <TooltipTrigger asChild>
        <span className={className} />
      </TooltipTrigger>
    );
  }
  
  // Convert children to array to handle all cases
  const childrenArray = React.Children.toArray(children);
  
  // If we have exactly one child and it's a valid React element
  if (childrenArray.length === 1 && React.isValidElement(childrenArray[0])) {
    const singleChild = childrenArray[0];
    
    // Clone the element to ensure we can add props safely
    const clonedChild = React.cloneElement(
      singleChild,
      {
        className: className ? `${singleChild.props.className || ''} ${className}`.trim() : singleChild.props.className,
      }
    );
    
    return <TooltipTrigger asChild>{clonedChild}</TooltipTrigger>;
  }
  
  // For all other cases (multiple children, text nodes, fragments, etc.)
  // wrap everything in a span to ensure we have a single React element
  return (
    <TooltipTrigger asChild>
      <span className={className}>{children}</span>
    </TooltipTrigger>
  );
};
