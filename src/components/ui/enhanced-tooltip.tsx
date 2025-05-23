
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
  // If no content, just render children without tooltip
  if (!content || children == null) {
    return <div className="inline-block">{children}</div>;
  }

  // If content is empty string, just render children
  if (typeof content === 'string' && content.trim() === '') {
    return <div className="inline-block">{children}</div>;
  }
  
  // Always render with our safe wrapper
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
