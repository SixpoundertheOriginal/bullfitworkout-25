
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDateRange } from '@/context/DateRangeContext';
import { format } from 'date-fns';
import { CalendarRange, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ComparisonDateRangePicker } from './ComparisonDateRangePicker';

interface ComparisonToggleProps {
  className?: string;
  showDateSelector?: boolean;
}

export function ComparisonToggle({ className = "", showDateSelector = false }: ComparisonToggleProps) {
  const { 
    comparisonEnabled, 
    setComparisonEnabled, 
    comparisonDateRange, 
    useCustomComparison,
  } = useDateRange();

  // Format date ranges for display
  const comparisonPeriodText = React.useMemo(() => {
    if (!comparisonDateRange?.from || !comparisonDateRange?.to) return '';
    
    return `${format(comparisonDateRange.from, 'MMM d')} - ${format(comparisonDateRange.to, 'MMM d')}`;
  }, [comparisonDateRange]);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center gap-2">
        <CalendarRange className="h-4 w-4 text-gray-400" />
        <Label htmlFor="comparison-toggle" className="text-sm cursor-pointer">
          Compare with previous period
        </Label>
      </div>
      <Switch
        id="comparison-toggle"
        checked={comparisonEnabled}
        onCheckedChange={setComparisonEnabled}
      />
      
      {comparisonEnabled && comparisonPeriodText && (
        <>
          {showDateSelector ? (
            <div className="ml-2">
              <ComparisonDateRangePicker />
            </div>
          ) : (
            <div className="ml-2 flex items-center text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-md">
              <Calendar className="h-3 w-3 mr-1" />
              {comparisonPeriodText}
              {useCustomComparison && (
                <span className="ml-1 text-xs bg-purple-900/30 text-purple-300 px-1 rounded">
                  Custom
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
