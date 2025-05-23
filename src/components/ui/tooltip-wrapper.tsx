
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
  
  // For asChild=true, we need to be extremely careful about what we pass
  // because TooltipTrigger will call React.Children.only on it
  
  // Handle null, undefined, or falsy children
  if (!children) {
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span />
      </TooltipTrigger>
    );
  }
  
  // Handle primitive types (string, number, boolean)
  if (typeof children === 'string' || typeof children === 'number' || typeof children === 'boolean') {
    return (
      <TooltipTrigger asChild={false} className={className}>
        {children}
      </TooltipTrigger>
    );
  }
  
  // Convert children to array and filter out falsy values
  let childArray: React.ReactNode[];
  try {
    childArray = React.Children.toArray(children).filter(Boolean);
  } catch (error) {
    // Fallback if React.Children.toArray fails
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span>{children}</span>
      </TooltipTrigger>
    );
  }
  
  // If no valid children after filtering
  if (childArray.length === 0) {
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span />
      </TooltipTrigger>
    );
  }
  
  // If multiple children, wrap in span
  if (childArray.length > 1) {
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span>{children}</span>
      </TooltipTrigger>
    );
  }
  
  // We have exactly one child - check if it's a valid React element
  const singleChild = childArray[0];
  
  if (!React.isValidElement(singleChild)) {
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span>{singleChild}</span>
      </TooltipTrigger>
    );
  }
  
  // We have a valid React element - try to use asChild=true
  try {
    // If we need to merge className, clone the element
    if (className) {
      const props = singleChild.props as any;
      const existingClassName = props?.className || '';
      const mergedClassName = existingClassName ? `${existingClassName} ${className}`.trim() : className;
      
      const clonedChild = React.cloneElement(singleChild, {
        ...props,
        className: mergedClassName,
      });
      
      return <TooltipTrigger asChild>{clonedChild}</TooltipTrigger>;
    }
    
    // No className to merge, pass the element directly
    return <TooltipTrigger asChild>{singleChild}</TooltipTrigger>;
  } catch (error) {
    // If anything fails, fall back to asChild=false
    console.error("TooltipWrapper: Failed to use asChild=true, falling back:", error);
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span>{singleChild}</span>
      </TooltipTrigger>
    );
  }
};
