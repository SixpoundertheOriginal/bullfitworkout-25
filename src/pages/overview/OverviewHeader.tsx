
import React from 'react';
import { ComparisonToggle } from '@/components/ui/period-comparison/ComparisonToggle';
import { useDateRange } from '@/context/DateRangeContext';
import { format } from 'date-fns';

interface OverviewHeaderProps {
  title: string;
}

export const OverviewHeader: React.FC<OverviewHeaderProps> = ({ title }) => {
  const { dateRange } = useDateRange();
  
  // Format the current date range for display
  const dateRangeText = React.useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return "All Time";
    
    return `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}`;
  }, [dateRange]);
  
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-gray-400 mt-1">
          {dateRangeText}
        </p>
      </div>
    </div>
  );
};
