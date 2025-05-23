
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
  // IMPORTANT: The critical issue is that when asChild=true, Radix UI calls React.Children.only()
  // on the children, which requires EXACTLY one React element (not string, array, etc.)

  // If asChild is false, we can safely render normally without worry
  if (!asChild) {
    return (
      <TooltipTrigger className={className}>
        {children}
      </TooltipTrigger>
    );
  }

  // For asChild=true, we need to handle all possible child types:
  
  // 1. Handle null/undefined/falsy children
  if (!children) {
    // Return a trigger with asChild=false and a fallback element
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span />
      </TooltipTrigger>
    );
  }

  // 2. Handle primitive value children (string, number, boolean)
  if (typeof children === 'string' || typeof children === 'number' || typeof children === 'boolean') {
    // Wrap primitives in a span
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span>{String(children)}</span>
      </TooltipTrigger>
    );
  }

  // 3. Process arrays or fragments by ensuring we have exactly one child element
  // Convert to array and filter out falsy values
  const childArray = React.Children.toArray(children).filter(Boolean);
  
  // If empty after filtering
  if (childArray.length === 0) {
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span />
      </TooltipTrigger>
    );
  }
  
  // If multiple children, we need to wrap them
  if (childArray.length > 1) {
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span>{childArray}</span>
      </TooltipTrigger>
    );
  }
  
  // Now we have exactly one child, check if it's a valid React element
  const singleChild = childArray[0];
  
  if (!React.isValidElement(singleChild)) {
    // Not a valid element, wrap it
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span>{singleChild}</span>
      </TooltipTrigger>
    );
  }
  
  // We have a valid React element - we can use asChild=true
  
  // If we need to add className, clone the element
  if (className) {
    const props = singleChild.props || {};
    const existingClassName = props.className || '';
    const mergedClassName = existingClassName 
      ? `${existingClassName} ${className}`.trim() 
      : className;
    
    const clonedChild = React.cloneElement(singleChild, {
      ...props,
      className: mergedClassName,
    });
    
    return <TooltipTrigger asChild>{clonedChild}</TooltipTrigger>;
  }
  
  // Just pass the valid element directly
  return <TooltipTrigger asChild>{singleChild}</TooltipTrigger>;
};
