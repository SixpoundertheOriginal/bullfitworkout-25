
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
  // If asChild is false, we can safely render with a wrapper
  if (!asChild) {
    return (
      <TooltipTrigger className={className}>
        {children}
      </TooltipTrigger>
    );
  }

  // For asChild=true, we need to be very careful about what we pass
  
  // Handle null/undefined children
  if (!children) {
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span style={{ display: 'contents' }} />
      </TooltipTrigger>
    );
  }

  // Handle primitive values (string, number, boolean)
  if (typeof children === 'string' || typeof children === 'number' || typeof children === 'boolean') {
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span style={{ display: 'contents' }}>{String(children)}</span>
      </TooltipTrigger>
    );
  }

  // Try to get a single React element
  let singleChild: React.ReactElement | null = null;
  
  try {
    // Convert children to array and filter valid elements
    const childArray = React.Children.toArray(children);
    const validElements = childArray.filter((child): child is React.ReactElement => 
      React.isValidElement(child)
    );
    
    if (validElements.length === 1) {
      singleChild = validElements[0];
    } else if (validElements.length > 1) {
      // Multiple valid elements - wrap them
      return (
        <TooltipTrigger asChild={false} className={className}>
          <span style={{ display: 'contents' }}>{validElements}</span>
        </TooltipTrigger>
      );
    } else if (childArray.length > 0) {
      // No valid elements but we have children - wrap everything
      return (
        <TooltipTrigger asChild={false} className={className}>
          <span style={{ display: 'contents' }}>{children}</span>
        </TooltipTrigger>
      );
    }
  } catch (error) {
    // If anything goes wrong, fall back to wrapper approach
    console.warn('TooltipWrapper: Error processing children, falling back to wrapper', error);
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span style={{ display: 'contents' }}>{children}</span>
      </TooltipTrigger>
    );
  }

  // If we don't have a single valid element, use wrapper approach
  if (!singleChild) {
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span style={{ display: 'contents' }}>{children}</span>
      </TooltipTrigger>
    );
  }

  // We have exactly one valid React element
  // Merge className if needed
  if (className) {
    const existingClassName = singleChild.props?.className || '';
    const mergedClassName = existingClassName 
      ? `${existingClassName} ${className}`.trim() 
      : className;
    
    try {
      const clonedChild = React.cloneElement(singleChild, {
        ...singleChild.props,
        className: mergedClassName,
      });
      
      return <TooltipTrigger asChild>{clonedChild}</TooltipTrigger>;
    } catch (error) {
      // If cloning fails, fall back to wrapper
      console.warn('TooltipWrapper: Error cloning element, falling back to wrapper', error);
      return (
        <TooltipTrigger asChild={false} className={className}>
          <span style={{ display: 'contents' }}>{children}</span>
        </TooltipTrigger>
      );
    }
  }
  
  // Return the single child as-is with asChild=true
  return <TooltipTrigger asChild>{singleChild}</TooltipTrigger>;
};
