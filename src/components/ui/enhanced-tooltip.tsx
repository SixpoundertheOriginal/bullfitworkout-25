
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
 * An enhanced tooltip component that safely handles all types of children
 */
export const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({
  content,
  children,
  side = "top",
  align = "center",
  delayDuration = 200,
  className = "",
  contentClassName = "",
  asChild = true,
}) => {
  // If no content, just render children without tooltip
  if (!content || children == null) {
    return <>{children}</>;
  }

  // If content is empty string, just render children
  if (typeof content === 'string' && content.trim() === '') {
    return <>{children}</>;
  }
  
  // Always render in the safest way possible
  return (
    <TooltipProvider>
      <Tooltip delayDuration={delayDuration}>
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
