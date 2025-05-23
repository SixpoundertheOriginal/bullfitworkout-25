
import React from "react";
import { TooltipTrigger } from "./tooltip";

interface TooltipWrapperProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

/**
 * A bulletproof wrapper component for tooltip triggers that completely avoids
 * React.Children.only errors by never using asChild and always wrapping content.
 */
export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  asChild = false, // We ignore this prop to avoid errors
  className = "",
}) => {
  // Always render as a button wrapper to avoid any children issues
  return (
    <TooltipTrigger asChild={false} className={className}>
      <button 
        type="button"
        className="inline-flex items-center justify-center w-full h-full bg-transparent border-0 p-0 m-0 cursor-pointer"
        style={{ 
          background: 'none',
          outline: 'none',
          font: 'inherit',
          color: 'inherit'
        }}
      >
        {children}
      </button>
    </TooltipTrigger>
  );
};
