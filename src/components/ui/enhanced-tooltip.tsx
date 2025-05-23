
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
 * An enhanced tooltip component that handles all edge cases for children
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
  console.log("EnhancedTooltip: Rendering with content:", content, "children:", children);
  
  // If no tooltip content is provided, just render the children directly
  if (!content) {
    console.log("EnhancedTooltip: No content provided, rendering children directly");
    return <>{children}</>;
  }

  // Handle the case where children might be undefined or null
  if (!children) {
    console.log("EnhancedTooltip: No children provided, returning null");
    return null;
  }

  // Ensure we have valid content to show
  if (typeof content === 'string' && content.trim() === '') {
    console.log("EnhancedTooltip: Empty string content, rendering children directly");
    return <>{children}</>;
  }

  console.log("EnhancedTooltip: Rendering tooltip with TooltipWrapper");
  
  // Use TooltipProvider to ensure proper context
  return (
    <TooltipProvider>
      <Tooltip delayDuration={delayDuration}>
        <TooltipWrapper asChild={asChild} className={className}>
          {children}
        </TooltipWrapper>
        <TooltipContent side={side} align={align} className={contentClassName}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
