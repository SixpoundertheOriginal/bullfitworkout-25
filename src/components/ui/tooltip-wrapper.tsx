
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

  // For asChild=true, we need to handle specially
  
  // Check if we have a single valid React element that can be cloned
  const isValidElement = React.isValidElement(children);
  
  // If children is a valid React element, use it directly
  if (isValidElement) {
    return <TooltipTrigger asChild>{children}</TooltipTrigger>;
  }
  
  // For all other cases (text nodes, multiple children, fragments, etc.),
  // wrap in a span to ensure TooltipTrigger gets exactly one child element
  return (
    <TooltipTrigger asChild>
      <span className={className}>{children}</span>
    </TooltipTrigger>
  );
}
