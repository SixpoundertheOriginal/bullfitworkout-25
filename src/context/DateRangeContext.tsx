
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, subDays, startOfWeek, endOfWeek, subWeeks } from 'date-fns';

interface DateRangeContextType {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  comparisonEnabled: boolean;
  setComparisonEnabled: (enabled: boolean) => void;
  comparisonDateRange: DateRange | undefined;
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

  // Calculate the comparison date range based on the current date range
  const comparisonDateRange = React.useMemo(() => {
    if (!dateRange?.from || !dateRange?.to || !comparisonEnabled) return undefined;
    
    const currentFrom = dateRange.from;
    const currentTo = dateRange.to;
    const rangeDays = Math.floor((currentTo.getTime() - currentFrom.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      from: subDays(currentFrom, rangeDays + 1),
      to: subDays(currentTo, rangeDays + 1)
    };
  }, [dateRange, comparisonEnabled]);

  // Log the current and comparison date ranges
  React.useEffect(() => {
    console.log("DateRangeContext initialized with range:", dateRange);
    if (comparisonEnabled) {
      console.log("Comparison date range:", comparisonDateRange);
    }
  }, [dateRange, comparisonDateRange, comparisonEnabled]);

  return (
    <DateRangeContext.Provider 
      value={{ 
        dateRange, 
        setDateRange, 
        comparisonEnabled, 
        setComparisonEnabled,
        comparisonDateRange 
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
