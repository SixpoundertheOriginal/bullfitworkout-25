
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
 * by using a defensive approach that always wraps children safely.
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
  
  // Always use a safe wrapper approach - never use asChild to avoid React.Children.only
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild={false} className={className}>
          <button
            type="button"
            className="inline-flex items-center justify-center w-full h-full bg-transparent border-0 p-0 m-0 cursor-pointer outline-none"
            style={{
              font: 'inherit',
              color: 'inherit',
              textAlign: 'inherit',
              lineHeight: 'inherit',
              textDecoration: 'inherit',
              background: 'transparent',
              border: 'none',
              padding: 0,
              margin: 0,
            }}
          >
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className={contentClassName}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
