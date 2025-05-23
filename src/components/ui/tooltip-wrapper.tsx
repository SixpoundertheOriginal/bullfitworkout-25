
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
  console.log("TooltipWrapper: Received children:", children, "asChild:", asChild);
  
  // If asChild is false, render as a normal button wrapper
  if (!asChild) {
    console.log("TooltipWrapper: Using asChild=false");
    return (
      <TooltipTrigger className={className}>
        {children}
      </TooltipTrigger>
    );
  }
  
  // Handle null, undefined, or falsy children
  if (!children) {
    console.log("TooltipWrapper: No children, falling back to span");
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span />
      </TooltipTrigger>
    );
  }
  
  // Handle primitive types (string, number, boolean)
  if (typeof children === 'string' || typeof children === 'number' || typeof children === 'boolean') {
    console.log("TooltipWrapper: Primitive child, falling back to span wrapper");
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span>{children}</span>
      </TooltipTrigger>
    );
  }
  
  // Convert children to array and filter out falsy values
  let childArray: React.ReactNode[];
  try {
    childArray = React.Children.toArray(children).filter(Boolean);
    console.log("TooltipWrapper: Child array length:", childArray.length);
  } catch (error) {
    console.error("TooltipWrapper: Error converting children to array:", error);
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span>{children}</span>
      </TooltipTrigger>
    );
  }
  
  // If no valid children after filtering
  if (childArray.length === 0) {
    console.log("TooltipWrapper: No valid children after filtering");
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span />
      </TooltipTrigger>
    );
  }
  
  // If multiple children, wrap in span
  if (childArray.length > 1) {
    console.log("TooltipWrapper: Multiple children, wrapping in span");
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span>{children}</span>
      </TooltipTrigger>
    );
  }
  
  // We have exactly one child - check if it's a valid React element
  const singleChild = childArray[0];
  console.log("TooltipWrapper: Single child:", singleChild, "isValidElement:", React.isValidElement(singleChild));
  
  if (!React.isValidElement(singleChild)) {
    console.log("TooltipWrapper: Not a valid React element, wrapping in span");
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span>{singleChild}</span>
      </TooltipTrigger>
    );
  }
  
  // We have a valid React element - try to use asChild=true
  try {
    console.log("TooltipWrapper: Attempting to use asChild=true with valid element");
    
    // If we need to merge className, clone the element
    if (className) {
      console.log("TooltipWrapper: Merging className:", className);
      const props = singleChild.props as any;
      const existingClassName = props?.className || '';
      const mergedClassName = existingClassName ? `${existingClassName} ${className}`.trim() : className;
      
      const clonedChild = React.cloneElement(singleChild, {
        ...props,
        className: mergedClassName,
      });
      
      console.log("TooltipWrapper: Successfully cloned element with merged className");
      return <TooltipTrigger asChild>{clonedChild}</TooltipTrigger>;
    }
    
    // No className to merge, pass the element directly
    console.log("TooltipWrapper: Using element directly with asChild=true");
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
