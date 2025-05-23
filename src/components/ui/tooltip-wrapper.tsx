
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
  const childCount = React.Children.count(children);
  const hasValidSingleChild = childCount === 1 && React.isValidElement(children);
  
  // If we have a single valid element, we can pass it directly to TooltipTrigger with asChild
  if (hasValidSingleChild) {
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
