
import React from "react";
import { TooltipTrigger } from "./tooltip";

interface TooltipWrapperProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

/**
 * A robust wrapper component for tooltip triggers that ensures compatibility
 * with Radix UI's TooltipTrigger component and its asChild prop.
 */
export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  asChild = true,
  className = "",
}) => {
  // Be extremely conservative - only use asChild for very specific cases
  const shouldUseAsChild = React.useMemo(() => {
    // If asChild is explicitly false, don't use it
    if (!asChild) return false;
    
    // Must be a valid React element
    if (!React.isValidElement(children)) return false;
    
    // Convert children to array to check count
    const childArray = React.Children.toArray(children);
    
    // Must have exactly one child
    if (childArray.length !== 1) return false;
    
    // The single child must be a valid React element
    const singleChild = childArray[0];
    if (!React.isValidElement(singleChild)) return false;
    
    // Don't use asChild for fragments - they can contain multiple children
    if (singleChild.type === React.Fragment) return false;
    
    // Don't use asChild for certain built-in elements that might cause issues
    if (typeof singleChild.type === 'string') {
      // Allow most HTML elements but be cautious with certain ones
      return true;
    }
    
    // For custom components, only use asChild if they're likely to be simple
    return typeof singleChild.type === 'function';
  }, [children, asChild]);

  // If we can't use asChild safely, wrap in a span
  if (!shouldUseAsChild) {
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span style={{ display: 'contents' }}>{children}</span>
      </TooltipTrigger>
    );
  }

  // We're confident we have a single React element - clone it with merged className
  const element = children as React.ReactElement;
  
  const mergedClassName = className 
    ? `${element.props?.className || ''} ${className}`.trim()
    : element.props?.className || '';
  
  return (
    <TooltipTrigger asChild={true}>
      {React.cloneElement(element, {
        ...element.props,
        className: mergedClassName || undefined
      })}
    </TooltipTrigger>
  );
};
