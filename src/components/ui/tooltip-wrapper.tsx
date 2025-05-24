
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
  // Be extremely conservative - only use asChild if we can guarantee it will work
  // We need exactly one React element, not a fragment, not text, not an array
  let shouldUseAsChild = false;
  
  try {
    // First check if it's a valid React element
    if (React.isValidElement(children)) {
      // Then check if React.Children.only would succeed
      // This is the most reliable way to know if asChild will work
      React.Children.only(children);
      shouldUseAsChild = true;
    }
  } catch (error) {
    // If React.Children.only throws, we definitely can't use asChild
    shouldUseAsChild = false;
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
