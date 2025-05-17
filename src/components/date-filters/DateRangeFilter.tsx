
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { useDateRange } from '@/context/DateRangeContext';

type DateRangeOption = {
  label: string;
  value: () => DateRange;
};

export function DateRangeFilter() {
  const { dateRange, setDateRange } = useDateRange();
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const today = new Date();
  
  const dateRangeOptions: DateRangeOption[] = [
    {
      label: 'Today',
      value: () => ({
        from: today,
        to: today,
      }),
    },
    {
      label: 'This Week',
      value: () => ({
        from: startOfWeek(today, { weekStartsOn: 1 }),
        to: endOfWeek(today, { weekStartsOn: 1 }),
      }),
    },
    {
      label: 'Last 30 Days',
      value: () => ({
        from: subDays(today, 29),
        to: today,
      }),
    },
    {
      label: 'Year to Date',
      value: () => ({
        from: startOfYear(today),
        to: today,
      }),
    },
  ];

  const [selectedPreset, setSelectedPreset] = useState<string>('This Week');

  // Initialize with "This Week" on component mount if no date range is set
  useEffect(() => {
    if (!isInitialized && (!dateRange?.from || !dateRange?.to)) {
      const thisWeekRange = dateRangeOptions.find(option => option.label === 'This Week');
      if (thisWeekRange) {
        setDateRange(thisWeekRange.value());
        setSelectedPreset(thisWeekRange.label);
        setIsInitialized(true);
      }
    } else if (!isInitialized && dateRange?.from && dateRange?.to) {
      // If there's already a date range set, just mark as initialized
      setIsInitialized(true);
      
      // Try to find matching preset
      const matchingPreset = dateRangeOptions.find(option => {
        const value = option.value();
        return value.from?.toDateString() === dateRange.from?.toDateString() && 
               value.to?.toDateString() === dateRange.to?.toDateString();
      });
      
      if (matchingPreset) {
        setSelectedPreset(matchingPreset.label);
      } else {
        setSelectedPreset('Custom Range');
      }
    }
  }, [dateRange, isInitialized, setDateRange, dateRangeOptions]);

  const handleSelect = (preset: DateRangeOption) => {
    const range = preset.value();
    setDateRange(range);
    setSelectedPreset(preset.label);
    setIsOpen(false);
  };
  
  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range);
      setSelectedPreset('Custom Range');
      setIsOpen(false);
    }
  };
  
  return (
    <div className="w-full flex items-center justify-end">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-auto justify-between text-sm bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-600",
              "shadow-sm py-2 px-4",
              !dateRange && "text-gray-400"
            )}
          >
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-purple-400" />
              <span className="font-medium">
                {selectedPreset === 'Custom Range' && dateRange?.from ? (
                  <>
                    {format(dateRange.from, "MMM d")} -{" "}
                    {dateRange.to ? format(dateRange.to, "MMM d, yyyy") : null}
                  </>
                ) : (
                  selectedPreset
                )}
              </span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 z-50" 
          align="end" 
          sideOffset={5}
        >
          <div className="bg-gray-900 border border-gray-700 rounded-md shadow-xl">
            <div className="grid gap-4 p-3">
              <div className="flex flex-col space-y-2">
                {dateRangeOptions.map((option) => (
                  <Button
                    key={option.label}
                    variant={selectedPreset === option.label ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleSelect(option)}
                    className="justify-start font-normal hover:bg-gray-700"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              <div className="border-t border-gray-700 pt-3">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleCalendarSelect}
                  numberOfMonths={1}
                  className="bg-gray-900 border-0 rounded-md pointer-events-auto"
                  classNames={{
                    day_selected: "bg-purple-600 text-white hover:bg-purple-700 focus:bg-purple-600",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                    day_today: "bg-gray-800 text-white",
                    nav_button: "border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700",
                    cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-purple-600/20",
                    caption: "relative flex items-center justify-center p-2 text-white",
                    caption_label: "text-sm font-medium text-gray-100",
                    head_cell: "text-gray-400 font-normal text-[0.8rem] py-2",
                    table: "w-full border-collapse space-y-1",
                    months: "bg-gray-900",
                    month: "space-y-2",
                  }}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
