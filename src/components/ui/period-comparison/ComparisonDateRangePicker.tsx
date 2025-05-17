
import React, { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { useDateRange } from '@/context/DateRangeContext';

interface ComparisonDateRangePickerProps {
  className?: string;
}

export function ComparisonDateRangePicker({ className }: ComparisonDateRangePickerProps) {
  const { 
    customComparisonRange, 
    setCustomComparisonRange,
    useCustomComparison,
    setUseCustomComparison,
    comparisonDateRange: automaticComparisonRange
  } = useDateRange();
  
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    customComparisonRange || automaticComparisonRange
  );

  // Format the display date
  const formatDisplayDate = (range: DateRange | undefined) => {
    if (!range?.from) return 'Select date range';
    if (!range.to) return format(range.from, 'MMM d, yyyy');
    return `${format(range.from, 'MMM d')} - ${format(range.to, 'MMM d, yyyy')}`;
  };

  // Handle save
  const handleSave = () => {
    if (dateRange?.from && dateRange.to) {
      setCustomComparisonRange(dateRange);
      setUseCustomComparison(true);
      setOpen(false);
    }
  };

  // Handle reset to automatic comparison
  const handleReset = () => {
    setCustomComparisonRange(undefined);
    setUseCustomComparison(false);
    setDateRange(automaticComparisonRange);
    setOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="comparison-date"
            variant={useCustomComparison ? "outline" : "ghost"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDisplayDate(useCustomComparison ? customComparisonRange : automaticComparisonRange)}
            {useCustomComparison && (
              <span className="ml-auto rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800">
                Custom
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0" 
          align="start"
          side="bottom"
          sideOffset={8}
        >
          <div className="bg-gray-900 border border-gray-700 rounded-md shadow-lg">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              className="bg-gray-900 rounded-md border-0"
              classNames={{
                day_selected: "bg-purple-600 text-white hover:bg-purple-700 focus:bg-purple-600",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                day_today: "bg-gray-800 text-white",
                nav_button: "border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700",
                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-purple-600/20",
                caption: "relative flex items-center justify-center p-2 text-white",
                caption_label: "text-sm font-medium text-gray-100",
                head_cell: "text-gray-400 font-normal text-[0.8rem] py-2",
              }}
            />
            <div className="flex items-center justify-between p-3 border-t border-gray-700 bg-gray-900">
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-gray-300 hover:text-white hover:bg-gray-800">
                Reset to Previous Period
              </Button>
              <Button size="sm" onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
