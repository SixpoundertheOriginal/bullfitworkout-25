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
  asChild = false,
  className = "",
}) => {
  // Be extremely conservative - almost never use asChild to avoid React.Children.only errors
  // Only use asChild if it's explicitly requested AND we have a single valid React element
  let shouldUseAsChild = false;
  
  if (asChild && React.isValidElement(children)) {
    // Even more conservative - only use asChild if explicitly requested
    // and we have a simple React element (not fragment, not complex structure)
    try {
      // Quick check: if it's a simple element with no complex children
      if (children.type && typeof children.type === 'string') {
        shouldUseAsChild = true;
      }
    } catch {
      shouldUseAsChild = false;
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
  
  // Otherwise, always wrap in our own button to ensure single child
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
