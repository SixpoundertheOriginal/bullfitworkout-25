
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
  // Helper function to safely check if we have exactly one valid React element
  const isSingleReactElement = (children: React.ReactNode): children is React.ReactElement => {
    // Must be a valid React element
    if (!React.isValidElement(children)) {
      return false;
    }
    
    // Handle React fragments - check if fragment contains exactly one element
    if (children.type === React.Fragment) {
      const fragmentChildren = React.Children.toArray(children.props.children);
      const validElements = fragmentChildren.filter(child => React.isValidElement(child));
      return validElements.length === 1;
    }
    
    // For regular elements, ensure it's not an array or other complex structure
    return true;
  };

  // If asChild is false or we don't have a single React element, use wrapper approach
  if (!asChild || !isSingleReactElement(children)) {
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span style={{ display: 'contents' }}>{children}</span>
      </TooltipTrigger>
    );
  }

  // We have exactly one React element - safe to use asChild={true}
  const element = children as React.ReactElement;
  
  // Handle React fragments by extracting the single child
  if (element.type === React.Fragment) {
    const fragmentChildren = React.Children.toArray(element.props.children);
    const validElement = fragmentChildren.find(child => React.isValidElement(child)) as React.ReactElement;
    
    const mergedClassName = className 
      ? `${validElement.props?.className || ''} ${className}`.trim()
      : validElement.props?.className || '';
    
    return (
      <TooltipTrigger asChild={true}>
        {React.cloneElement(validElement, {
          ...validElement.props,
          className: mergedClassName || undefined
        })}
      </TooltipTrigger>
    );
  }
  
  // Handle regular React elements
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
