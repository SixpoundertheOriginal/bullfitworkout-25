
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
  // Helper function to check if we have exactly one valid React element
  const getSingleValidElement = (children: React.ReactNode): React.ReactElement | null => {
    if (!children) return null;
    
    // Handle single React element
    if (React.isValidElement(children)) {
      return children as React.ReactElement;
    }
    
    // Handle arrays
    if (Array.isArray(children)) {
      const validElements = children.filter(child => React.isValidElement(child));
      return validElements.length === 1 ? validElements[0] as React.ReactElement : null;
    }
    
    // Handle React fragments
    if (React.isValidElement(children) && children.type === React.Fragment) {
      const fragmentChildren = React.Children.toArray(children.props.children);
      const validElements = fragmentChildren.filter(child => React.isValidElement(child));
      return validElements.length === 1 ? validElements[0] as React.ReactElement : null;
    }
    
    return null;
  };

  // If asChild is false, always wrap in a span
  if (!asChild) {
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span style={{ display: 'contents' }}>{children}</span>
      </TooltipTrigger>
    );
  }

  // Try to get a single valid element
  const singleElement = getSingleValidElement(children);
  
  if (singleElement) {
    // We have exactly one valid React element - safe to use asChild={true}
    const mergedClassName = className 
      ? `${singleElement.props.className || ''} ${className}`.trim()
      : singleElement.props.className;
    
    return (
      <TooltipTrigger asChild={true}>
        {React.cloneElement(singleElement, {
          ...singleElement.props,
          className: mergedClassName
        })}
      </TooltipTrigger>
    );
  } else {
    // No single valid element - fall back to wrapper with asChild={false}
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span style={{ display: 'contents' }}>{children}</span>
      </TooltipTrigger>
    );
  }
};
