
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
 * and always wrapping in a safe container.
 */
export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  asChild = false, // We ignore this prop to avoid any React.Children.only errors
  className = "",
}) => {
  // NEVER use asChild - always wrap in our own element to guarantee single child
  // This completely avoids any React.Children.only calls from Radix components
  return (
    <TooltipTrigger className={className}>
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
    </TooltipTrigger>
  );
};
