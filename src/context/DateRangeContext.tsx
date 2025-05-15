
import React, { createContext, useContext, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { subDays, startOfWeek, endOfWeek } from 'date-fns';

interface DateRangeContextType {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
}

// Create context with default undefined value
const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with the current week (Monday to Sunday)
  const now = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfWeek(now, { weekStartsOn: 1 }), // Monday
    to: endOfWeek(now, { weekStartsOn: 1 }), // Sunday
  });

  // Create a memoized value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    dateRange,
    setDateRange
  }), [dateRange]);

  return (
    <DateRangeContext.Provider value={contextValue}>
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
