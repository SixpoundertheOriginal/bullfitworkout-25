// src/components/ui/tooltip-wrapper.tsx
import React from "react";
import { TooltipTrigger } from "./tooltip";

interface TooltipWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A bulletproof wrapper that prevents React.Children.only errors
 * and avoids invalid DOM structures like nested <button>s.
 */
export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  className = "",
}) => {
  const isSafeSingleReactElement =
    React.isValidElement(children) &&
    typeof children.type !== "string" && // not <div>, <button>, etc.
    !Array.isArray(children);

  return (
    <TooltipTrigger asChild={isSafeSingleReactElement} className={className}>
      {isSafeSingleReactElement ? (
        children
      ) : (
        <span className="inline-flex items-center justify-center w-full h-full cursor-pointer">
          {children}
        </span>
      )}
    </TooltipTrigger>
  );
};
