
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
  // Be very conservative - only use asChild={true} for simple, direct React elements
  const canUseAsChild = () => {
    if (!asChild) return false;
    if (!React.isValidElement(children)) return false;
    
    // Don't use asChild for fragments
    if (children.type === React.Fragment) return false;
    
    // Don't use asChild for arrays or other complex structures
    if (Array.isArray(children)) return false;
    
    // Only use asChild for simple React elements
    return true;
  };

  // If we can't safely use asChild, always use the wrapper approach
  if (!canUseAsChild()) {
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span style={{ display: 'contents' }}>{children}</span>
      </TooltipTrigger>
    );
  }

  // We have a simple React element - safe to use asChild={true}
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
