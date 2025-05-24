import React from "react";
import { TooltipTrigger } from "./tooltip";

interface TooltipWrapperProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

/**
 * A bulletproof wrapper component for tooltip triggers that handles both
 * single React elements and other content safely.
 */
export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  asChild = false, // We can use this now since we handle it properly
  className = "",
}) => {
  // Implement our own safe check without calling React.Children.only
  // We need to be extremely conservative about when to use asChild
  let shouldUseAsChild = false;
  
  // Only use asChild if:
  // 1. children is a valid React element (not string, number, null, undefined, array)
  // 2. children is not a React fragment
  // 3. children is not an array of elements
  if (React.isValidElement(children)) {
    // Additional safety checks
    const isFragment = children.type === React.Fragment;
    const isArray = Array.isArray(children);
    
    // Only use asChild for single, non-fragment React elements
    if (!isFragment && !isArray) {
      // Final check: ensure we don't have multiple children in a fragment-like structure
      const childrenArray = React.Children.toArray(children);
      if (childrenArray.length === 1) {
        shouldUseAsChild = true;
      }
    }
  }
  
  // If we can safely use asChild, do so
  if (shouldUseAsChild) {
    return (
      <TooltipTrigger asChild={true} className={className}>
        {children}
      </TooltipTrigger>
    );
  }
  
  // Otherwise, wrap in our own button to ensure single child
  return (
    <TooltipTrigger asChild={false} className={className}>
      <button 
        type="button"
        className="inline-flex items-center justify-center w-full h-full bg-transparent border-0 p-0 m-0 cursor-pointer"
        style={{ 
          background: 'none',
          outline: 'none',
          font: 'inherit',
          color: 'inherit',
          textAlign: 'inherit'
        }}
      >
        {children}
      </button>
    </TooltipTrigger>
  );
};
