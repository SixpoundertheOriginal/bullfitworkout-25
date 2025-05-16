
import React, { createContext, useContext, useState, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { subDays, startOfWeek, endOfWeek } from 'date-fns';

interface DateRangeContextType {
  dateRange: DateRange;  // No longer undefined
  setDateRange: (range: DateRange | undefined) => void;
}

// Create context with meaningful default values
const DateRangeContext = createContext<DateRangeContextType>({
  dateRange: {
    from: startOfWeek(new Date(), { weekStartsOn: 1 }),
    to: endOfWeek(new Date(), { weekStartsOn: 1 })
  },
  setDateRange: () => {}
});

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with the current week (Monday to Sunday)
  const now = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfWeek(now, { weekStartsOn: 1 }), // Monday
    to: endOfWeek(now, { weekStartsOn: 1 }), // Sunday
  });

  // Handle undefined values gracefully to maintain stable state
  const handleSetDateRange = (newRange: DateRange | undefined) => {
    if (!newRange) return;
    
    const safeRange: DateRange = {
      from: newRange.from || dateRange.from,
      to: newRange.to || dateRange.to
    };
    
    setDateRange(safeRange);
  };

  // Create a memoized value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    dateRange,
    setDateRange: handleSetDateRange
  }), [dateRange]);

  return (
    <DateRangeContext.Provider value={contextValue}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange(): DateRangeContextType {
  const context = useContext(DateRangeContext);
  return context; // Now we can safely return context without undefined check
}
