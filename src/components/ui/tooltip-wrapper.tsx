
import React from "react";
import { TooltipTrigger } from "./tooltip";

interface TooltipWrapperProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

/**
 * A bulletproof wrapper component for tooltip triggers that handles any
 * React.Children.only issues by always providing a single, valid React element.
 */
export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  asChild = false, // We completely ignore this prop
  className = "",
}) => {
  // Always create a single, guaranteed React element
  // This approach completely bypasses any React.Children.only issues
  return (
    <TooltipTrigger asChild={false} className={className}>
      <button
        type="button"
        className="inline-flex items-center justify-center w-full h-full bg-transparent border-0 p-0 m-0 cursor-pointer outline-none"
        style={{
          font: 'inherit',
          color: 'inherit',
          textAlign: 'inherit',
          lineHeight: 'inherit',
          textDecoration: 'inherit',
          background: 'transparent',
          border: 'none',
          padding: 0,
          margin: 0,
        }}
      >
        {children}
      </button>
    </TooltipTrigger>
  );
};
