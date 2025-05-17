
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, subDays, startOfWeek, endOfWeek } from 'date-fns';

interface DateRangeContextType {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  comparisonEnabled: boolean;
  setComparisonEnabled: (enabled: boolean) => void;
  comparisonDateRange: DateRange | undefined;
  customComparisonRange: DateRange | undefined;
  setCustomComparisonRange: (range: DateRange | undefined) => void;
  useCustomComparison: boolean;
  setUseCustomComparison: (useCustom: boolean) => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export function DateRangeProvider({ children }: { children: ReactNode }) {
  // Default to current week
  const today = new Date();
  const defaultDateRange: DateRange = {
    from: startOfWeek(today, { weekStartsOn: 1 }),
    to: today
  };

  const [dateRange, setDateRange] = useState<DateRange | undefined>(defaultDateRange);
  const [comparisonEnabled, setComparisonEnabled] = useState<boolean>(false);
  const [customComparisonRange, setCustomComparisonRange] = useState<DateRange | undefined>(undefined);
  const [useCustomComparison, setUseCustomComparison] = useState<boolean>(false);

  // Calculate the comparison date range based on the current date range
  const comparisonDateRange = React.useMemo(() => {
    if (!dateRange?.from || !dateRange?.to || !comparisonEnabled) return undefined;
    
    // If using custom date range, return that instead
    if (useCustomComparison && customComparisonRange?.from && customComparisonRange?.to) {
      return customComparisonRange;
    }
    
    // Default: Calculate previous period with same duration
    const currentFrom = dateRange.from;
    const currentTo = dateRange.to;
    const rangeDays = Math.floor((currentTo.getTime() - currentFrom.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      from: subDays(currentFrom, rangeDays + 1),
      to: subDays(currentTo, rangeDays + 1)
    };
  }, [dateRange, comparisonEnabled, useCustomComparison, customComparisonRange]);

  // Reset custom comparison when date range changes significantly
  useEffect(() => {
    // Only reset if we're not using custom comparison or if dateRange drastically changes
    if (!useCustomComparison || !customComparisonRange || !dateRange?.from || !dateRange?.to) return;
    
    // Check if the date range has changed by more than 30 days
    const customStart = customComparisonRange.from?.getTime() || 0;
    const currentStart = dateRange.from.getTime();
    const diffDays = Math.abs(customStart - currentStart) / (1000 * 60 * 60 * 24);
    
    // If date range changed drastically, reset custom comparison
    if (diffDays > 30) {
      setUseCustomComparison(false);
      setCustomComparisonRange(undefined);
    }
  }, [dateRange, customComparisonRange, useCustomComparison]);

  return (
    <DateRangeContext.Provider 
      value={{ 
        dateRange, 
        setDateRange, 
        comparisonEnabled, 
        setComparisonEnabled,
        comparisonDateRange,
        customComparisonRange,
        setCustomComparisonRange,
        useCustomComparison,
        setUseCustomComparison
      }}
    >
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (context === undefined) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
}
