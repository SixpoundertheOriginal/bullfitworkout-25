
import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/use-haptics";
import { typography } from "@/lib/typography";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
  onClick?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  highlight?: boolean;
  size?: 'sm' | 'md' | 'lg';
  colorVariant?: 'default' | 'primary' | 'secondary' | 'accent';
}

export function StatCard({ 
  icon, 
  label, 
  value, 
  className, 
  onClick, 
  trend,
  highlight = false,
  size = 'md',
  colorVariant = 'default'
}: StatCardProps) {
  const { triggerHaptic } = useHaptics();
  
  // Define size-based classes
  const sizeClasses = {
    sm: {
      container: "p-3",
      icon: "text-lg mb-1.5",
      value: "text-xl mb-0.5",
      label: "text-xs",
    },
    md: {
      container: "p-4",
      icon: "text-xl mb-2",
      value: "text-2xl mb-1",
      label: "text-xs",
    },
    lg: {
      container: "p-5",
      icon: "text-2xl mb-3",
      value: "text-3xl mb-2",
      label: "text-sm",
    }
  };
  
  // Define color variants
  const colorVariants = {
    default: {
      container: "bg-gray-800/80 border-gray-800 hover:border-gray-700",
      icon: "text-purple-400",
      highlight: "bg-gray-800/95 border-purple-700/50",
    },
    primary: {
      container: "bg-purple-900/30 border-purple-800/30 hover:border-purple-700",
      icon: "text-purple-400",
      highlight: "bg-purple-900/40 border-purple-600/50",
    },
    secondary: {
      container: "bg-blue-900/30 border-blue-800/30 hover:border-blue-700",
      icon: "text-blue-400",
      highlight: "bg-blue-900/40 border-blue-600/50",
    },
    accent: {
      container: "bg-pink-900/30 border-pink-800/30 hover:border-pink-700",
      icon: "text-pink-400",
      highlight: "bg-pink-900/40 border-pink-600/50",
    },
  };
  
  // Handle click with haptic feedback
  const handleClick = () => {
    if (onClick) {
      triggerHaptic('selection');
      onClick();
    }
  };

  // Component to render trend indicator if present
  const TrendIndicator = trend ? (
    <div className={cn(
      "absolute top-3 right-3 flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5",
      trend.isPositive ? "text-emerald-400 bg-emerald-900/30" : "text-red-400 bg-red-900/30"
    )}>
      <span>
        {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
      </span>
      {trend.label && <span className="text-[10px] opacity-70">{trend.label}</span>}
    </div>
  ) : null;
  
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      className={cn(
        // Base styles
        "relative flex flex-col items-center rounded-xl border transition-all duration-200",
        // Card styling
        colorVariants[colorVariant].container,
        sizeClasses[size].container,
        // Interactive states
        onClick && "hover:bg-opacity-90 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer",
        // Highlight state
        highlight && colorVariants[colorVariant].highlight,
        // Additional animation
        "motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]",
        className
      )}
      onClick={handleClick}
      aria-label={onClick ? `View more details about ${label}` : undefined}
    >
      {TrendIndicator}
      
      <div className={cn(
        colorVariants[colorVariant].icon,
        sizeClasses[size].icon
      )}>
        {icon}
      </div>
      
      <div className={cn(
        // Value styling with iOS-like typography
        "font-semibold leading-none",
        sizeClasses[size].value,
        typography.special.title3
      )}>
        {value}
      </div>
      
      <div className={cn(
        // Label styling
        "text-gray-400",
        sizeClasses[size].label,
        typography.special.caption
      )}>
        {label}
      </div>
    </Component>
  );
}
