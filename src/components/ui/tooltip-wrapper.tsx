
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
  // If asChild is false, we can safely wrap children in a span
  if (!asChild) {
    return (
      <TooltipTrigger asChild={false} className={className}>
        <span style={{ display: 'contents' }}>{children}</span>
      </TooltipTrigger>
    );
  }

  // For asChild=true, we need to ensure we have exactly one valid React element
  
  // Handle null/undefined children
  if (children == null) {
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
        <span style={{ display: 'contents' }}>{children}</span>
      </TooltipTrigger>
    );
  }

  // Handle arrays and fragments
  if (Array.isArray(children)) {
    const validElements = children.filter(child => React.isValidElement(child));
    
    if (validElements.length === 1) {
      const singleChild = validElements[0];
      return (
        <TooltipTrigger asChild={true}>
          {className ? React.cloneElement(singleChild, {
            ...singleChild.props,
            className: `${singleChild.props.className || ''} ${className}`.trim()
          }) : singleChild}
        </TooltipTrigger>
      );
    } else {
      // Multiple or no valid elements - use wrapper
      return (
        <TooltipTrigger asChild={false} className={className}>
          <span style={{ display: 'contents' }}>{children}</span>
        </TooltipTrigger>
      );
    }
  }

  // Handle React fragments
  if (React.isValidElement(children) && children.type === React.Fragment) {
    const fragmentChildren = React.Children.toArray(children.props.children);
    const validElements = fragmentChildren.filter(child => React.isValidElement(child));
    
    if (validElements.length === 1) {
      const singleChild = validElements[0] as React.ReactElement;
      return (
        <TooltipTrigger asChild={true}>
          {className ? React.cloneElement(singleChild, {
            ...singleChild.props,
            className: `${singleChild.props.className || ''} ${className}`.trim()
          }) : singleChild}
        </TooltipTrigger>
      );
    } else {
      return (
        <TooltipTrigger asChild={false} className={className}>
          <span style={{ display: 'contents' }}>{fragmentChildren}</span>
        </TooltipTrigger>
      );
    }
  }

  // Handle single React element
  if (React.isValidElement(children)) {
    return (
      <TooltipTrigger asChild={true}>
        {className ? React.cloneElement(children, {
          ...children.props,
          className: `${children.props.className || ''} ${className}`.trim()
        }) : children}
      </TooltipTrigger>
    );
  }

  // Fallback for any other case - use wrapper
  return (
    <TooltipTrigger asChild={false} className={className}>
      <span style={{ display: 'contents' }}>{children}</span>
    </TooltipTrigger>
  );
};
