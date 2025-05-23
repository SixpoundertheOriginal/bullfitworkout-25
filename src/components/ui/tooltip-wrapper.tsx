
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
  // Check if children is a single React element
  // We need to be very careful here - only use asChild if we have exactly one React element
  const isSingleElement = React.isValidElement(children) && 
    !Array.isArray(children) && 
    React.Children.count(children) === 1;
  
  // If we have a single valid React element, we can safely use asChild
  if (isSingleElement) {
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
