
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
  // If asChild is false, we use TooltipTrigger directly with className support
  if (!asChild) {
    return <TooltipTrigger className={className}>{children}</TooltipTrigger>;
  }
  
  // For asChild=true, we need special handling to ensure a single child element
  
  // First, check if children is a valid single element that can be cloned
  const childCount = React.Children.count(children);
  
  // If we have exactly one child that is a valid element, pass it directly
  if (childCount === 1 && React.isValidElement(children)) {
    return <TooltipTrigger asChild>{children}</TooltipTrigger>;
  }
  
  // For all other cases (multiple children, text nodes, etc.),
  // wrap in a span to ensure we pass exactly one element to asChild
  return (
    <TooltipTrigger asChild>
      <span className={className}>{children}</span>
    </TooltipTrigger>
  );
}
