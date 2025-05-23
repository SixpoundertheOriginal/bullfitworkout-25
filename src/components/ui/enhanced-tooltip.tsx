
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
} from "./tooltip";
import { TooltipWrapper } from "./tooltip-wrapper";

interface EnhancedTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
  className?: string;
  contentClassName?: string;
  asChild?: boolean;
}

/**
 * A completely safe tooltip component that never triggers React.Children.only errors
 * by ensuring proper element nesting and avoiding asChild propagation issues.
 */
export const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({
  content,
  children,
  side = "top",
  align = "center",
  delayDuration = 200,
  className = "",
  contentClassName = "",
  asChild = true, // We ignore this to avoid errors
}) => {
  // If no content or empty content, just render children without tooltip
  if (!content || 
      children == null || 
      (typeof content === 'string' && content.trim() === '')) {
    return <div className="inline-block">{children}</div>;
  }
  
  // Always render with our safe wrapper to guarantee we don't hit React.Children.only errors
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipWrapper className={className}>
          {children}
        </TooltipWrapper>
        <TooltipContent side={side} align={align} className={contentClassName}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
