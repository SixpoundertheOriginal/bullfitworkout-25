
import React from 'react';
import { BaseCard } from "@/components/ui/BaseCard";
import { Tooltip, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { LucideIcon } from 'lucide-react';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';

interface MetricCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  tooltip?: string;
  description?: string;
  gradientClass?: string;
  valueClass?: string;
  labelClass?: string;
  progressValue?: number;
  badgeText?: string;
  badgeColor?: string;
  onClick?: () => void;
  className?: string;
}

export function MetricCard({
  icon: Icon,
  value,
  label,
  tooltip,
  description,
  gradientClass = "from-primary/20 via-transparent to-primary/20",
  valueClass = "text-primary",
  labelClass = "",
  progressValue,
  badgeText,
  badgeColor = "text-green-400",
  onClick,
  className
}: MetricCardProps) {
  return (
    <BaseCard 
      className={`rounded-lg relative transition-all overflow-hidden ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''} ${gradientClass} ${className || ''}`}
      onClick={onClick}
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2.5">
          <div className="bg-white/5 rounded-full p-1.5">
            <Icon className="h-3.5 w-3.5 text-white/70" />
          </div>
          
          {badgeText && (
            <div className={`text-xs font-medium flex items-center ${badgeColor}`}>
              {badgeText}
            </div>
          )}
        </div>

        {tooltip ? (
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipWrapper>
                <div>
                  <div className={`text-xl font-bold mb-1 ${valueClass}`}>{value}</div>
                  <div className={`text-xs text-white/60 ${labelClass}`}>{label}</div>
                  {description && <div className="text-[10px] text-white/40 mt-0.5">{description}</div>}
                </div>
              </TooltipWrapper>
              <TooltipContent>
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div>
            <div className={`text-xl font-bold mb-1 ${valueClass}`}>{value}</div>
            <div className={`text-xs text-white/60 ${labelClass}`}>{label}</div>
            {description && <div className="text-[10px] text-white/40 mt-0.5">{description}</div>}
          </div>
        )}
          
        {typeof progressValue === 'number' && (
          <div className="mt-3 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        )}
      </div>
    </BaseCard>
  );
}
