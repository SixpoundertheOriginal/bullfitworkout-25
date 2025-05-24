
import React from "react";
import { TooltipTrigger } from "./tooltip";

interface TooltipWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A completely safe wrapper that never uses asChild and always provides
 * a single React element to TooltipTrigger.
 */
export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  className = "",
}) => {
  return (
    <TooltipTrigger asChild={false} className={className}>
      <div className="inline-block w-full h-full">
        {children}
      </div>
    </TooltipTrigger>
  );
};
