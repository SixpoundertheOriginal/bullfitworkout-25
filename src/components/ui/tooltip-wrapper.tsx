
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
    
    // Only clone and merge className if the child has a className prop
    // Use type assertion to tell TypeScript this element can have className
    if (className && 'className' in singleChild.props) {
      const existingClassName = singleChild.props.className as string || '';
      const mergedClassName = existingClassName ? `${existingClassName} ${className}`.trim() : className;
      
      const clonedChild = React.cloneElement(
        singleChild as React.ReactElement<{ className?: string }>,
        {
          className: mergedClassName,
        }
      );
      
      return <TooltipTrigger asChild>{clonedChild}</TooltipTrigger>;
    }
    
    // If no className to merge, just pass the child directly
    return <TooltipTrigger asChild>{singleChild}</TooltipTrigger>;
  }
  
  // For all other cases (multiple children, text nodes, fragments, etc.)
  // wrap everything in a span to ensure we have a single React element
  return (
    <TooltipTrigger asChild>
      <span className={className}>{children}</span>
    </TooltipTrigger>
  );
};
