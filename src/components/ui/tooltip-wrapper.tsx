
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
  // Always use the safest approach - never use asChild to avoid React.Children.only errors
  return (
    <TooltipTrigger asChild={false} className={className}>
      <div style={{ display: 'inline-block', width: 'fit-content' }}>
        {children}
      </div>
    </TooltipTrigger>
  );
};
