
import React from "react";
import { TooltipTrigger } from "./tooltip";

interface TooltipWrapperProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

/**
 * A bulletproof wrapper component for tooltip triggers that handles both
 * single React elements and other content safely by NEVER using asChild
 * and always wrapping in a safe container that guarantees a single child.
 */
export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  asChild = false, // We ignore this prop to avoid any React.Children.only errors
  className = "",
}) => {
  // Always create a single wrapper element that contains all children
  // This guarantees TooltipTrigger receives exactly one React element
  const wrappedChildren = (
    <span 
      className="inline-flex items-center justify-center w-full h-full cursor-pointer"
      style={{ 
        background: 'transparent',
        border: 'none',
        padding: 0,
        margin: 0,
        font: 'inherit',
        color: 'inherit',
        textAlign: 'inherit'
      }}
    >
      {children}
    </span>
  );

  // NEVER use asChild - always pass our single wrapper element
  // This completely avoids any React.Children.only calls from Radix components
  return (
    <TooltipTrigger className={className}>
      {wrappedChildren}
    </TooltipTrigger>
  );
};
