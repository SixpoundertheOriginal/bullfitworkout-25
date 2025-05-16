import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Add a helper function to format metric changes for display
export function formatMetricChange(current: number, previous: number): { value: string; color: string } {
  if (!previous) return { value: '--', color: 'text-gray-400' };
  
  const diff = current - previous;
  const percentChange = (diff / previous) * 100;
  
  // Format the percentage change
  const formattedValue = `${diff > 0 ? '+' : ''}${Math.round(percentChange)}%`;
  
  // Determine color based on direction
  const color = diff > 0 
    ? 'text-green-400' 
    : diff < 0 
    ? 'text-red-400' 
    : 'text-gray-400';
  
  return { value: formattedValue, color };
}

// Add a time-of-day helper
export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}
