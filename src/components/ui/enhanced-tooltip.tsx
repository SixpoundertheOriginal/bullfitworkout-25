
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
  // If no content or children, just render children without tooltip
  if (!content || children == null) {
    return <>{children}</>;
  }

  // If content is empty string, just render children
  if (typeof content === 'string' && content.trim() === '') {
    return <>{children}</>;
  }
  
  // Additional safety check for React.Children.only error
  if (!React.isValidElement(children)) {
    // If children is not a valid React element, wrap it in a span
    return (
      <TooltipProvider>
        <Tooltip delayDuration={delayDuration}>
          <TooltipWrapper asChild={false} className={className}>
            <span>{children}</span>
          </TooltipWrapper>
          <TooltipContent side={side} align={align} className={contentClassName}>
            {content}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
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
