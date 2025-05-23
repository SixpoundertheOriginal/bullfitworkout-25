
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
  // If asChild is false or children is null/undefined, wrap in a span
  if (!asChild || children == null) {
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span style={{ display: 'contents' }}>{children}</span>
      </TooltipTrigger>
    );
  }

  // Handle single React element
  if (React.isValidElement(children)) {
    const mergedClassName = className 
      ? `${(children.props?.className || '')} ${className}`.trim()
      : children.props?.className || '';
    
    return (
      <TooltipTrigger asChild={true}>
        {React.cloneElement(children, {
          ...children.props,
          className: mergedClassName || undefined
        })}
      </TooltipTrigger>
    );
  }

  // Handle primitive values, arrays, or other non-element children by wrapping them in a span
  return (
    <TooltipTrigger asChild={false} className={className}>
      <span style={{ display: 'contents' }}>{children}</span>
    </TooltipTrigger>
  );
};
