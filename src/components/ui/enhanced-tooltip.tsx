
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
 * by always using a span wrapper and avoiding asChild entirely.
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
  
  // Always use a span element with asChild=false to avoid React.Children.only errors
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild={false}>
          <span className={`inline-flex items-center justify-center ${className}`}>
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className={contentClassName}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
