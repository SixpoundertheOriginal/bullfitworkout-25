
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from '@/components/ui/badge';

export type Option = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  className?: string;
  placeholder?: string;
  badgeClassName?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  selected = [],
  onChange,
  className,
  placeholder = "Select options",
  badgeClassName,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  
  // Ensure selected is always an array to prevent "undefined is not iterable" error
  const safeSelected = Array.isArray(selected) ? selected : [];
  
  const handleUnselect = useCallback((value: string) => {
    onChange(safeSelected.filter((v) => v !== value));
  }, [safeSelected, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = e.target as HTMLInputElement;
    if (input.value === "" && e.key === "Backspace") {
      onChange(safeSelected.slice(0, -1));
    }
  }, [safeSelected, onChange]);

  // This ref helps track clicks on badges for determining focus
  const commandRef = useRef<HTMLDivElement>(null);
  
  // Calculate the display labels based on selected values
  const selectedLabels = safeSelected.map((value) => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value;
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "min-h-[40px] h-auto flex-wrap justify-between",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 items-center">
            {safeSelected.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {safeSelected.length > 0 && 
              safeSelected.map((value) => {
                const label = selectedLabels[safeSelected.indexOf(value)];
                return (
                  <Badge
                    key={value}
                    className={cn(
                      "px-1 py-0 mr-1 mb-1",
                      badgeClassName
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!disabled) handleUnselect(value);
                    }}
                  >
                    {label}
                    {!disabled && (
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!disabled) handleUnselect(value);
                        }}
                      />
                    )}
                  </Badge>
                );
              })
            }
          </div>
          <div>
            {!disabled && (
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command ref={commandRef}>
          <CommandInput 
            placeholder="Search..." 
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = safeSelected.indexOf(option.value) !== -1;
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      if (disabled) return;
                      
                      const newSelected = isSelected
                        ? safeSelected.filter((v) => v !== option.value)
                        : [...safeSelected, option.value];
                      
                      onChange(newSelected);
                      setInputValue("");
                    }}
                    className={cn(
                      "flex items-center gap-2", 
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={disabled}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
