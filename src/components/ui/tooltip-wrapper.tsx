
import React from "react";
import { TooltipTrigger } from "./tooltip";

interface TooltipWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A simple wrapper that never uses asChild to avoid React.Children.only errors.
 * Always wraps content in a div to ensure consistent structure.
 */
export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  className = "",
}) => {
  return (
    <TooltipTrigger asChild={false} className={className}>
      <div className="inline-flex items-center justify-center w-full h-full cursor-pointer">
        {children}
      </div>
    </TooltipTrigger>
  );
};
