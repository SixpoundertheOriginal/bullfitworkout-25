
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

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
 * by wrapping content in a single div element instead of using asChild.
 */
export const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({
  content,
  children,
  side = "top",
  align = "center",
  delayDuration = 200,
  className = "",
  contentClassName = "",
}) => {
  // If no content or empty content, just render children without tooltip
  if (!content || 
      children == null || 
      (typeof content === 'string' && content.trim() === '')) {
    return <>{children}</>;
  }
  
  // Always wrap in a single div to avoid React.Children.only errors
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild={false} className={className}>
          <div className="inline-block w-full">
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className={contentClassName}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
