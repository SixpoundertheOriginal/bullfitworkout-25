
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, ArrowRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonKPIProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  percentChange?: number;
  className?: string;
  direction?: 'up-good' | 'down-good';
  tooltip?: string;
  isLoading?: boolean;
}

export function ComparisonKPI({ 
  title, 
  value, 
  previousValue, 
  percentChange, 
  className = "",
  direction = 'up-good', 
  tooltip,
  isLoading = false
}: ComparisonKPIProps) {
  const hasComparison = previousValue !== undefined;
  const formattedPercentage = percentChange !== undefined 
    ? `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%`
    : undefined;
    
  // Determine color based on change direction and whether up or down is good
  const getChangeColor = () => {
    if (percentChange === undefined || percentChange === 0) return "text-gray-400";
    
    if (direction === 'up-good') {
      return percentChange > 0 ? "text-green-500" : "text-red-500";
    } else {
      return percentChange < 0 ? "text-green-500" : "text-red-500";
    }
  };
  
  // Get the appropriate arrow icon
  const getChangeIcon = () => {
    if (percentChange === undefined) return null;
    if (percentChange === 0) return <ArrowRightIcon className="h-3 w-3" />;
    return percentChange > 0 
      ? <ArrowUpIcon className="h-3 w-3" /> 
      : <ArrowDownIcon className="h-3 w-3" />;
  };

  return (
    <Card className={cn("bg-gray-900 border-gray-800", className)}>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-24 bg-gray-800 animate-pulse rounded"></div>
        ) : (
          <div className="flex flex-col">
            <div className="text-4xl font-bold">{value}</div>
            
            {hasComparison && (
              <div className="mt-2 flex items-center text-sm">
                <span className="text-gray-400 mr-2">vs. previous: </span>
                <span className="text-gray-300">{previousValue}</span>
                
                {formattedPercentage && (
                  <div className={`ml-2 flex items-center ${getChangeColor()}`}>
                    {getChangeIcon()}
                    <span className="ml-1">{formattedPercentage}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
