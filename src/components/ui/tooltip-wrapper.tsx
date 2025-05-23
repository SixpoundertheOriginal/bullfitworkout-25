
import React from "react";
import { TooltipTrigger } from "./tooltip";

interface TooltipWrapperProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

/**
 * A helper component to properly wrap tooltip triggers.
 * This ensures we always provide a single child to React.Children.only.
 */
export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  asChild = true,
  className = "",
}) => {
  // If asChild is false, simply render TooltipTrigger with children directly
  if (!asChild) {
    return <TooltipTrigger className={className}>{children}</TooltipTrigger>;
  }

  // For asChild=true, we need to create a valid trigger element
  
  // When we have exactly one React element child and asChild is true,
  // we can pass it directly to TooltipTrigger with asChild=true
  if (React.isValidElement(children) && React.Children.count(children) === 1) {
    return <TooltipTrigger asChild>{children}</TooltipTrigger>;
  }
  
  // For all other cases (multiple children, text nodes, arrays, etc.),
  // we need to wrap everything in a single span element
  return (
    <TooltipTrigger asChild>
      <span className={className}>{children}</span>
    </TooltipTrigger>
  );
};
